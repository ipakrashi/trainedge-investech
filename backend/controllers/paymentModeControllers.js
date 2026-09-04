import asyncHandler from 'express-async-handler'
import paymentModeModel from '../models/paymentModeModel.js'

// @desc    Get all active payment modes
// @route   GET /api/payment-modes
// @access  Private
export const getPaymentModes = asyncHandler(async (req, res) => {
    const modes = await paymentModeModel
        .find({ isActive: true })
        .sort({ label: 1 })
    res.status(200).json({ success: true, data: modes })
})

// @desc    Create a new payment mode
// @route   POST /api/payment-modes
// @access  Private/Admin
export const createPaymentMode = asyncHandler(async (req, res) => {
    const { name, label } = req.body

    if (!name || !label) {
        res.status(400)
        throw new Error('Name and label are required for payment mode')
    }

    const modeExists = await paymentModeModel.findOne({
        name: name.toLowerCase(),
    })
    if (modeExists) {
        res.status(400)
        throw new Error('Payment mode already exists')
    }

    const paymentMode = await paymentModeModel.create({
        name: name.toLowerCase(),
        label,
    })

    res.status(201).json({ success: true, data: paymentMode })
})
