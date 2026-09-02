import mongoose from 'mongoose'

const roleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Role name is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
)

const Role = mongoose.model('Role', roleSchema)
export default Role
