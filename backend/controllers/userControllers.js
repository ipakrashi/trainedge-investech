import asyncHandler from 'express-async-handler'
import userModel from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const addUser = asyncHandler(async (req, res) => {
    const {
        image,
        firstName,
        lastName,
        email,
        password,
        role,
        address,
        city,
        pincode,
        phone,
    } = req.body

    if (!firstName || !lastName || !email || !password) {
        res.status(400)
        throw new Error('All fields are mandatory')
    }

    const userExists = await userModel.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error('User Exists')
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        image,
        role,
        address,
        city,
        pincode,
        phone,
    })
    if (user) {
        res.status(200).json(user)
    } else {
        res.status(400)
        throw new Error('Invalid User Data')
    }
})

const getUsers = asyncHandler(async (req, res) => {
    const users = await userModel.find({}).populate('role')
    if (users) {
        res.status(200).json(users)
    } else {
        res.status(404).json({ message: 'No Users Found' })
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400)
        throw new Error('Please provide email and password')
    }

    const user = await userModel
        .findOne({ email })
        .select('+password')
        .populate('role')

    if (user && (await bcrypt.compare(password, user.password))) {
        // --- NEW: INCREMENT TOKEN VERSION ON EVERY LOGIN ---
        user.tokenVersion = (user.tokenVersion || 0) + 1
        await user.save()

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role.name,
                tokenVersion: user.tokenVersion, // --- NEW: EMBED VERSION IN TOKEN ---
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
        )

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role.name,
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    })

    res.status(200).json({ message: 'User logged out successfully' })
})

const editUser = asyncHandler(async (req, res) => {
    if (
        req.user.role !== 'admin' &&
        req.user._id.toString() !== req.params.id
    ) {
        res.status(403)
        throw new Error('Not authorized to edit this profile')
    }

    const user = await userModel.findById(req.params.id)

    if (user) {
        user.firstName = req.body.firstName || user.firstName
        user.lastName = req.body.lastName || user.lastName
        user.email = req.body.email || user.email
        user.image = req.body.image || user.image

        if (req.user.role === 'admin' && req.body.role) {
            user.role = req.body.role
        }

        user.address = req.body.address || user.address
        user.city = req.body.city || user.city
        user.pincode = req.body.pincode || user.pincode
        user.phone = req.body.phone || user.phone
        user.isActive =
            req.body.isActive !== undefined ? req.body.isActive : user.isActive

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(req.body.password, salt)
        }

        const updatedUser = await user.save()
        res.status(200).json(updatedUser)
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

const deleteUser = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.params.id)

    if (user) {
        await user.deleteOne()
        res.status(200).json({ message: 'User removed successfully' })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

const getRoles = asyncHandler(async (req, res) => {
    const roles = await userModel.distinct('role')
    res.status(200).json(roles)
})

export {
    addUser,
    getUsers,
    loginUser,
    logoutUser,
    editUser,
    deleteUser,
    getRoles,
}
