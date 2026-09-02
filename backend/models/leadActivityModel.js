import mongoose from 'mongoose'
const leadActivitySchema = mongoose.Schema(
    {
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'leadModel',
            required: true,
            index: true,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
        type: {
            type: String,
            enum: [
                'CALL',
                'WHATSAPP',
                'EMAIL',
                'NOTE',
                'DEMO',
                'STATUS_CHANGE',
            ],
            required: true,
        },
        summary: {
            type: String,
            required: true,
            trim: true,
        },
        details: {
            callDurationSeconds: Number,
            callOutcome: {
                type: String,
                enum: [
                    'CONNECTED',
                    'BUSY',
                    'NO_ANSWER',
                    'WRONG_NUMBER',
                    'CALLBACK_REQUESTED',
                ],
            },
            oldStatus: String,
            newStatus: String,
        },
    },
    {
        timestamps: true,
    },
)
const leadActivityModel = mongoose.model(
    'leadActivityModel',
    leadActivitySchema,
    'leadActivities',
)
export default leadActivityModel
