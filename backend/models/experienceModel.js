import mongoose from 'mongoose'
const experienceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        }, // e.g., 'BEGINNER'
        label: { type: String, required: true, trim: true }, // e.g., 'Beginner'
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    },
)
const experienceModel = mongoose.model(
    'experienceModel',
    experienceSchema,
    'experiences',
)
export default experienceModel
