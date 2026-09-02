import asyncHandler from 'express-async-handler'
import Role from '../models/roleModel.js'

// @desc    Get all roles
// route    GET /api/roles
// @access  Private/Admin
const getRoles = asyncHandler(async (req, res) => {
    const roles = await Role.find({})
    res.status(200).json(roles)
})

// @desc    Create a new role
// route    POST /api/roles
// @access  Private/Admin
const createRole = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name) {
        res.status(400)
        throw new Error('Role name is required')
    }

    const roleExists = await Role.findOne({ name: name.toLowerCase() })
    if (roleExists) {
        res.status(400)
        throw new Error('Role already exists')
    }

    const role = await Role.create({
        name: name.toLowerCase(),
        description,
    })

    if (role) {
        res.status(201).json(role)
    } else {
        res.status(400)
        throw new Error('Invalid role data')
    }
})

export { getRoles, createRole }
