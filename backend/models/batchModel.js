import mongoose from 'mongoose'

const batchSchema = mongoose.Schema(
    {
        batchName: {
            type: String,
            required: true,
            trim: true,
            unique: true, // e.g., "Equity Options - Weekend Oct 2026"
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseModel',
            required: true,
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
            index: true,
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'studentModel',
            },
        ],
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'],
            default: 'UPCOMING',
        },
    },
    { timestamps: true },
)

const batchModel = mongoose.model('batchModel', batchSchema, 'batches')
export default batchModel
