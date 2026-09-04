// server/models/paymentModeModel.js
import mongoose from 'mongoose'

const paymentModeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
)

const paymentModeModel =
    mongoose.models.PaymentMode ||
    mongoose.model('PaymentMode', paymentModeSchema, 'paymentmodes')

export default paymentModeModel
