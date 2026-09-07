import mongoose from 'mongoose'

const demoSessionSchema = mongoose.Schema(
    {
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'leadModel',
            required: true,
            index: true,
        },
        demoMaster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'demoMasterModel',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
            index: true,
        },
        scheduledDate: {
            type: Date,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
            default: 'SCHEDULED',
            index: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        clientComments: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

export default mongoose.model(
    'demoSessionModel',
    demoSessionSchema,
    'demoSessions',
)
