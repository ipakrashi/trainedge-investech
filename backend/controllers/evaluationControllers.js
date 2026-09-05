import asyncHandler from 'express-async-handler'
import Evaluation from '../models/evaluationModel.js'
import Batch from '../models/batchModel.js'

// @desc    Record exam evaluations for multiple students at once
// @route   POST /api/evaluations/bulk
// @access  Private (Faculty/Admin)
const recordBulkEvaluations = asyncHandler(async (req, res) => {
    const { batchId, examTitle, examDate, totalMarks, grades } = req.body
    // `grades` expected format: [{ student: "id", obtainedMarks: 85, grade: "A", facultyRemarks: "Good" }, ...]

    const batch = await Batch.findById(batchId)
    if (!batch) {
        res.status(404)
        throw new Error('Batch not found')
    }

    const userRole = (
        req.user?.role?.name ||
        req.user?.role ||
        ''
    ).toLowerCase()
    if (
        userRole === 'faculty' &&
        batch.faculty.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized to evaluate this batch')
    }

    // Map the incoming array into individual evaluation documents
    const evaluationDocs = grades.map((g) => ({
        batch: batchId,
        student: g.student,
        faculty: req.user._id,
        examTitle,
        totalMarks,
        obtainedMarks: g.obtainedMarks,
        grade: g.grade,
        facultyRemarks: g.facultyRemarks,
        examDate: examDate || Date.now(),
    }))

    // Insert all records into the database in a single operation
    const savedEvaluations = await Evaluation.insertMany(evaluationDocs)

    res.status(201).json({
        success: true,
        count: savedEvaluations.length,
        data: savedEvaluations,
    })
})

// @desc    Get all evaluations for a specific batch
// @route   GET /api/evaluations/batch/:batchId
// @access  Private (Faculty/Admin)
const getBatchEvaluations = asyncHandler(async (req, res) => {
    const { batchId } = req.params

    const evaluations = await Evaluation.find({ batch: batchId })
        .populate('student', 'fullName email')
        .sort({ examDate: -1, examTitle: 1 })

    res.status(200).json({
        success: true,
        count: evaluations.length,
        data: evaluations,
    })
})

// @desc    Get all evaluations for a specific student (Generates a Report Card)
// @route   GET /api/evaluations/student/:studentId
// @access  Private (Admin/Faculty)
const getStudentEvaluations = asyncHandler(async (req, res) => {
    const { studentId } = req.params

    const evaluations = await Evaluation.find({ student: studentId })
        .populate('batch', 'batchName')
        .populate('faculty', 'firstName lastName')
        .sort({ examDate: -1 })

    res.status(200).json({
        success: true,
        count: evaluations.length,
        data: evaluations,
    })
})

// @desc    Get macro academic/grade report for a specific batch (Admin/Faculty)
// @route   GET /api/evaluations/report/:batchId
// @access  Private
const getBatchAcademicReport = asyncHandler(async (req, res) => {
    const { batchId } = req.params

    const batch = await Batch.findById(batchId).populate(
        'course',
        'courseTitle',
    )
    if (!batch) {
        res.status(404)
        throw new Error('Batch not found')
    }

    const evaluations = await Evaluation.find({ batch: batchId })
        .populate('student', 'fullName email')
        .sort({ examDate: -1 })

    // Group by examTitle to analyze performance per exam
    const examMap = {}
    evaluations.forEach((evalDoc) => {
        const title = evalDoc.examTitle
        if (!examMap[title]) {
            examMap[title] = {
                examTitle: title,
                examDate: evalDoc.examDate,
                totalMarks: evalDoc.totalMarks,
                scores: [],
                records: [],
            }
        }
        examMap[title].scores.push(evalDoc.obtainedMarks)
        examMap[title].records.push(evalDoc)
    })

    const examSummaries = Object.values(examMap).map((exam) => {
        const count = exam.scores.length
        const sum = exam.scores.reduce((a, b) => a + b, 0)
        const avg = count ? (sum / count).toFixed(1) : 0
        const highest = count ? Math.max(...exam.scores) : 0
        const lowest = count ? Math.min(...exam.scores) : 0
        const avgPercentage = exam.totalMarks
            ? ((avg / exam.totalMarks) * 100).toFixed(1)
            : 0

        return {
            examTitle: exam.examTitle,
            examDate: exam.examDate,
            totalMarks: exam.totalMarks,
            totalEvaluated: count,
            averageScore: avg,
            averagePercentage: avgPercentage,
            highestScore: highest,
            lowestScore: lowest,
            records: exam.records,
        }
    })

    res.status(200).json({
        success: true,
        batchName: batch.batchName,
        courseTitle: batch.course?.courseTitle || 'N/A',
        totalExamsConducted: examSummaries.length,
        data: examSummaries,
    })
})

// Ensure you export this new method alongside your others:
export default {
    recordBulkEvaluations,
    getBatchEvaluations,
    getStudentEvaluations,
    getBatchAcademicReport, // <-- ADDED HERE
}
