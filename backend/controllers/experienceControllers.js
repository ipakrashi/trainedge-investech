import experienceModel from '../models/experienceModel.js'
import asyncHandler from 'express-async-handler'

export const getExperiences = asyncHandler(async (req, res) => {
    const experiences = await experienceModel.find({ isActive: true }).sort({
        order: 1,
    })
    res.status(200).json({ success: true, data: experiences })
})

export const createExperience = asyncHandler(async (req, res) => {
    const { name, label, order } = req.body
    const experience = await experienceModel.create({ name, label, order })
    res.status(201).json({ success: true, data: experience })
})
