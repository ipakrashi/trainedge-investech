import statusModel from '../models/statusModel.js'
import asyncHandler from 'express-async-handler'

export const getStatuses = asyncHandler(async (req, res) => {
    const statuses = await statusModel
        .find({ isActive: true })
        .sort({ order: 1 })
    res.status(200).json({ success: true, data: statuses })
})

export const createStatus = asyncHandler(async (req, res) => {
    const { name, label, colorClass, bgClass, order } = req.body
    const status = await statusModel.create({
        name,
        label,
        colorClass,
        bgClass,
        order,
    })
    res.status(201).json({ success: true, data: status })
})
