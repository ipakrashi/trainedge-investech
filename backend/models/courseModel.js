import mongoose from 'mongoose'

const courseSchema = mongoose.Schema(
    {
        courseTitle: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        category: {
            type: String,
            enum: ['DERIVATIVES', 'EQUITY', 'COMPREHENSIVE', 'CURRENCY'],
            required: true,
        },
        fee: {
            type: Number,
            required: true,
            min: 0,
        },
        durationWeeks: {
            type: Number,
            default: 4,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // NEW: Link the course to a specific faculty member
        assignedFaculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const courseModel = mongoose.model('courseModel', courseSchema, 'courses')
export default courseModel
