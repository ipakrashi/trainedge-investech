import mongoose from 'mongoose'
const enrollmentSchema = mongoose.Schema(
    {
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lead',
            required: true,
            unique: true, // One enrollment record per converted lead
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        batchCode: {
            type: String, // e.g., "BATCH-2026-SEP-01"
            required: true,
            trim: true,
        },
        counselor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
        totalFee: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        finalPayable: {
            type: Number,
            required: true,
        },
        amountPaid: {
            type: Number,
            default: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PARTIAL', 'COMPLETED', 'REFUNDED'],
            default: 'PENDING',
        },
        payments: [
            {
                transactionId: String,
                amount: Number,
                mode: {
                    type: String,
                    enum: ['UPI', 'NET_BANKING', 'CARD', 'CASH', 'CHEQUE'],
                },
                paidAt: {
                    type: Date,
                    default: Date.now,
                },
                recordedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'userModel',
                },
            },
        ],
    },
    {
        timestamps: true,
    },
)
const enrollmentModel = mongoose.model(
    'enrollmentModel',
    enrollmentSchema,
    'enrollments',
)
export default enrollmentModel
