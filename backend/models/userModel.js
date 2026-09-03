import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        image: {
            type: String,
        },
        firstName: {
            type: String,
            required: [true, 'First Name is required'],
            trim: true,
            maxlength: 100,
        },
        lastName: {
            type: String,
            required: [true, 'Last Name is required'],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: [true, 'Role is required'],
        },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        pincode: { type: String, trim: true },
        phone: { type: String, trim: true },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
        tokenVersion: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
)

userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password
        return ret
    },
})

const userModel = mongoose.model('userModel', userSchema, 'users')
export default userModel
