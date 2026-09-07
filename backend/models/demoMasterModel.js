import mongoose from 'mongoose'

const demoMasterSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Demo title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        durationMinutes: {
            type: Number,
            default: 30,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    },
)

export default mongoose.model(
    'demoMasterModel',
    demoMasterSchema,
    'demoMasters',
)
