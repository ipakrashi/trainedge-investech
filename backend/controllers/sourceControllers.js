import sourceModel from '../models/sourceModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Get all active lead sources
// @route   GET /api/sources
// @access  Private
export const getSources = asyncHandler(async (req, res) => {
    // Only fetch active sources, sort alphabetically by label
    const sources = await sourceModel
        .find({ isActive: true })
        .sort({ label: 1 })

    res.status(200).json({
        success: true,
        data: sources,
    })
})

// @desc    Create a new lead source
// @route   POST /api/sources
// @access  Private (Admin Only)
export const createSource = asyncHandler(async (req, res) => {
    const { name, label } = req.body

    const source = await sourceModel.create({ name, label })

    res.status(201).json({
        success: true,
        data: source,
    })
})
