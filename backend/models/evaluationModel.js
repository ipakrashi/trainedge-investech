import mongoose from 'mongoose'

const evaluationSchema = mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'batchModel',
            required: true,
            index: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'studentModel',
            required: true,
            index: true,
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
        examTitle: {
            type: String,
            required: true,
            trim: true,
        },
        totalMarks: {
            type: Number,
            required: true,
            min: 0,
        },
        obtainedMarks: {
            type: Number,
            required: true,
            min: 0,
        },
        grade: {
            type: String,
            trim: true,
        },
        facultyRemarks: {
            type: String,
            trim: true,
        },
        examDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
)

const evaluationModel = mongoose.model(
    'evaluationModel',
    evaluationSchema,
    'evaluations',
)
export default evaluationModel
