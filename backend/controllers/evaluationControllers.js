import asyncHandler from 'express-async-handler'
import Evaluation from '../models/evaluationModel.js'
import Batch from '../models/batchModel.js'
import Exam from '../models/examModel.js'

// Helper: Calculate grade based on exam's gradingScale
const calculateGrade = (obtainedMarks, totalMarks, gradingScale) => {
    if (totalMarks <= 0) return '-'
    const percentage = (obtainedMarks / totalMarks) * 100

    const defaultScale = [
        { grade: 'A+', minPercentage: 90 },
        { grade: 'A', minPercentage: 80 },
        { grade: 'B', minPercentage: 65 },
        { grade: 'C', minPercentage: 50 },
        { grade: 'F', minPercentage: 0 },
    ]

    const activeScale =
        gradingScale && gradingScale.length > 0 ? gradingScale : defaultScale

    // Sort descending by percentage threshold
    const sorted = [...activeScale].sort(
        (a, b) => b.minPercentage - a.minPercentage,
    )

    for (const tier of sorted) {
        if (percentage >= tier.minPercentage) {
            return tier.grade
        }
    }
    return 'F'
}

// @desc    Record exam evaluations for multiple students at once (with auto-grading)
// @route   POST /api/evaluations/bulk
// @access  Private (Faculty/Admin)
const recordBulkEvaluations = asyncHandler(async (req, res) => {
    const { batchId, examId, examTitle, totalMarks, examDate, grades } =
        req.body

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

    let finalTitle = examTitle
    let finalTotalMarks = Number(totalMarks)
    let examDoc = null

    if (examId) {
        examDoc = await Exam.findById(examId)
        if (examDoc) {
            finalTitle = examDoc.title
            finalTotalMarks = examDoc.totalMarks
        }
    }

    if (!finalTitle || !finalTotalMarks) {
        res.status(400)
        throw new Error('Exam title and total marks are required')
    }

    // Auto-calculate grades on backend before saving
    const bulkOps = grades.map((g) => {
        const marksObtained = Number(g.obtainedMarks)
        const computedGrade = calculateGrade(
            marksObtained,
            finalTotalMarks,
            examDoc?.gradingScale,
        )

        return {
            updateOne: {
                filter: {
                    batch: batchId,
                    student: g.student,
                    ...(examId ? { exam: examId } : { examTitle: finalTitle }),
                },
                update: {
                    $set: {
                        batch: batchId,
                        student: g.student,
                        faculty: req.user._id,
                        ...(examId && { exam: examId }),
                        examTitle: finalTitle,
                        totalMarks: finalTotalMarks,
                        obtainedMarks: marksObtained,
                        grade: computedGrade,
                        facultyRemarks: g.facultyRemarks || '',
                        examDate: examDate || Date.now(),
                    },
                },
                upsert: true,
            },
        }
    })

    const result = await Evaluation.bulkWrite(bulkOps)

    res.status(201).json({
        success: true,
        message: 'Evaluations recorded successfully with auto-grading',
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
    })
})

// @desc    Get all evaluations for a specific batch
// @route   GET /api/evaluations/batch/:batchId
// @access  Private (Faculty/Admin)
const getBatchEvaluations = asyncHandler(async (req, res) => {
    const { batchId } = req.params

    const evaluations = await Evaluation.find({ batch: batchId })
        .populate('student', 'fullName email')
        .populate(
            'exam',
            'title totalMarks passingMarks durationMinutes gradingScale',
        )
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
        .populate('exam', 'title totalMarks passingMarks')
        .sort({ examDate: -1 })

    res.status(200).json({
        success: true,
        count: evaluations.length,
        data: evaluations,
    })
})

// @desc    Get macro academic/grade report for a specific batch
// @route   GET /api/evaluations/report/:batchId
// @access  Private (Admin/Faculty)
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
        throw new Error(
            'Not authorized to access academic reports for this cohort',
        )
    }

    const evaluations = await Evaluation.find({ batch: batchId })
        .populate('student', 'fullName email')
        .populate('exam', 'title totalMarks passingMarks')
        .sort({ examDate: -1 })

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

export default {
    recordBulkEvaluations,
    getBatchEvaluations,
    getStudentEvaluations,
    getBatchAcademicReport,
}
