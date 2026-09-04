// server/models/paymentModel.js
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'studentModel', // Matches mongoose.model('studentModel', studentSchema, 'students')
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        transactionId: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        paymentMode: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentMode',
            required: true,
        },
        collectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
        remarks: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
)

const paymentModel =
    mongoose.models.Payment || mongoose.model('Payment', paymentSchema)
export default paymentModel
