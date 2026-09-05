import mongoose from 'mongoose'

const sessionLogSchema = mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'batchModel',
            required: true,
            index: true,
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
        sessionDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
        durationMinutes: {
            type: Number,
            required: true,
            default: 120, // Default 2 hours
        },
        topicsCovered: {
            type: String,
            required: true,
        },
        nextSessionPlan: {
            type: String,
        },
        // Array of student IDs who were present
        attendance: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'studentModel',
            },
        ],
    },
    { timestamps: true },
)

const sessionLogModel = mongoose.model(
    'sessionLogModel',
    sessionLogSchema,
    'sessionLogs',
)
export default sessionLogModel
