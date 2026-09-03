import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import userModel from '../models/userModel.js'

const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.user = await userModel
                .findById(decoded.userId || decoded.id)
                .select('-password')
                .populate('role')

            if (!req.user) {
                res.status(401)
                throw new Error('Not Authorized, User Not Found')
            }

            // --- CONCURRENT LOGIN CHECK ---
            if (decoded.tokenVersion !== req.user.tokenVersion) {
                res.status(401)
                throw new Error(
                    'Session expired. Your account was accessed from another device.',
                )
            }

            // --- NEW: HEARTBEAT TRACKER ---
            // Update lastLogin on every API call to keep the session alive
            userModel
                .updateOne({ _id: req.user._id }, { lastLogin: new Date() })
                .exec()
                .catch((err) =>
                    console.error('Heartbeat update failed:', err.message),
                )

            next()
        } catch (error) {
            if (error.message.includes('Session expired')) {
                res.status(401)
                throw new Error(error.message)
            }

            res.status(401)
            throw new Error('Not Authorized, Invalid Token')
        }
    } else {
        res.status(401)
        throw new Error('Not Authorized, No Token')
    }
})

// ADMIN MIDDLEWARE
const admin = (req, res, next) => {
    const userRoleName = req.user?.role?.name?.toLowerCase()

    if (req.user && req.user.role && userRoleName === 'admin') {
        next()
    } else {
        res.status(401)
        throw new Error('Not Authorized as Admin')
    }
}

// RestrictTo Middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        const userRoleName = req.user?.role?.name?.toLowerCase()
        const allowedRoles = roles.map((r) => r.toLowerCase())

        if (
            !req.user ||
            !req.user.role ||
            !allowedRoles.includes(userRoleName)
        ) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action.',
            })
        }

        next()
    }
}

export { protect, admin, restrictTo }
