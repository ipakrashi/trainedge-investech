import asyncHandler from 'express-async-handler'
import Exam from '../models/examModel.js'

// @desc    Create a new exam blueprint
// @route   POST /api/exams
// @access  Private/Admin
export const createExam = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        course,
        totalMarks,
        passingMarks,
        durationMinutes,
    } = req.body

    const existingExam = await Exam.findOne({ title })
    if (existingExam) {
        res.status(400)
        throw new Error('An exam with this title already exists')
    }

    const exam = await Exam.create({
        title,
        description,
        course,
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        durationMinutes: Number(durationMinutes) || 60,
        createdBy: req.user._id,
    })

    res.status(201).json({ success: true, data: exam })
})

// @desc    Get all exams (can filter by course via ?course=ID)
// @route   GET /api/exams
// @access  Private (Admin/Faculty)
export const getExams = asyncHandler(async (req, res) => {
    const filter = { isActive: true }
    if (req.query.course) {
        filter.course = req.query.course
    }

    const exams = await Exam.find(filter)
        .populate('course', 'courseTitle category')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })

    res.status(200).json({ success: true, count: exams.length, data: exams })
})

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id).populate(
        'course',
        'courseTitle',
    )
    if (!exam) {
        res.status(404)
        throw new Error('Exam not found')
    }
    res.status(200).json({ success: true, data: exam })
})

// @desc    Update exam blueprint
// @route   PUT /api/exams/:id
// @access  Private/Admin
export const updateExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id)
    if (!exam) {
        res.status(404)
        throw new Error('Exam not found')
    }

    exam.title = req.body.title || exam.title
    exam.description =
        req.body.description !== undefined
            ? req.body.description
            : exam.description
    exam.course = req.body.course || exam.course
    exam.totalMarks = req.body.totalMarks
        ? Number(req.body.totalMarks)
        : exam.totalMarks
    exam.passingMarks =
        req.body.passingMarks !== undefined
            ? Number(req.body.passingMarks)
            : exam.passingMarks
    exam.durationMinutes = req.body.durationMinutes
        ? Number(req.body.durationMinutes)
        : exam.durationMinutes
    if (req.body.isActive !== undefined) exam.isActive = req.body.isActive

    const updatedExam = await exam.save()
    res.status(200).json({ success: true, data: updatedExam })
})

// @desc    Soft-delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
export const deleteExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id)
    if (!exam) {
        res.status(404)
        throw new Error('Exam not found')
    }
    exam.isActive = false
    await exam.save()
    res.status(200).json({ success: true, message: 'Exam deactivated' })
})
