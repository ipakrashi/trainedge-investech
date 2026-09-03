import mongoose from 'mongoose'
const statusSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        }, // e.g., 'NEW'
        label: { type: String, required: true, trim: true }, // e.g., 'New'
        colorClass: { type: String, default: 'border-blue-500' }, // For pipeline UI
        bgClass: { type: String, default: 'bg-blue-50' }, // For pipeline UI
        order: { type: Number, default: 0 }, // To control Pipeline column order
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    },
)
const statusModel = mongoose.model('statusModel', statusSchema, 'statuses')
export default statusModel
