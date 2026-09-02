import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import userModel from '../models/userModel.js'

const protect = asyncHandler(async (req, res, next) => {
    let token

    // READ THE JWT FROM COOKIE
    token = req.cookies.jwt
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // CRITICAL CHANGE: .populate('role') fetches the Role document
            // instead of just leaving an ObjectId string.
            req.user = await userModel
                .findById(decoded.userId || decoded.id)
                .select('-password')
                .populate('role')

            if (!req.user) {
                res.status(401)
                throw new Error('Not Authorized, User Not Found')
            }

            next()
        } catch (error) {
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
    // Check if the user exists and the populated role's name is 'admin'
    const userRoleName = req.user?.role?.name?.toLowerCase()

    if (req.user && req.user.role && userRoleName === 'admin') {
        next()
    } else {
        res.status(401)
        throw new Error('Not Authorized as Admin')
    }
}

// RestrictTo Middleware (Ensures the user has the correct role)
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Extract the role name from the populated role document safely
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

        // If the user's role name is in the allowed roles array, move to the controller
        next()
    }
}

export { protect, admin, restrictTo }
