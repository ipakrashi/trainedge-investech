import mongoose from 'mongoose'

const examQuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true, trim: true },
    questionType: {
        type: String,
        enum: ['MCQ', 'SHORT_ANSWER', 'NUMERICAL'],
        default: 'MCQ',
    },
    options: [{ type: String, trim: true }],
    correctOptionIndex: { type: Number },
    marks: { type: Number, required: true, default: 1 },
})

const gradeTierSchema = new mongoose.Schema(
    {
        grade: { type: String, required: true, trim: true },
        minPercentage: { type: Number, required: true, min: 0, max: 100 },
    },
    { _id: false },
)

const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Exam title is required'],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseModel',
            required: [true, 'Course reference is required'],
            index: true,
        },
        totalMarks: {
            type: Number,
            required: [true, 'Total marks are required'],
            min: [1, 'Total marks must be at least 1'],
        },
        passingMarks: {
            type: Number,
            required: [true, 'Passing marks are required'],
            min: [0, 'Passing marks cannot be negative'],
        },
        durationMinutes: {
            type: Number,
            default: 60,
            min: [10, 'Duration must be at least 10 minutes'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
        gradingScale: {
            type: [gradeTierSchema],
            default: [
                { grade: 'A+', minPercentage: 90 },
                { grade: 'A', minPercentage: 80 },
                { grade: 'B', minPercentage: 65 },
                { grade: 'C', minPercentage: 50 },
                { grade: 'F', minPercentage: 0 },
            ],
        },
        questions: [examQuestionSchema],
    },
    { timestamps: true },
)

const examModel = mongoose.model('examModel', examSchema, 'exams')
export default examModel
