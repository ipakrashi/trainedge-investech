import asyncHandler from 'express-async-handler'
import Batch from '../models/batchModel.js'
import Student from '../models/studentModel.js'

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private/Admin
const createBatch = asyncHandler(async (req, res) => {
    const { batchName, course, faculty, startDate, endDate } = req.body

    const batchExists = await Batch.findOne({ batchName })
    if (batchExists) {
        res.status(400)
        throw new Error('A batch with this name already exists')
    }

    const batch = await Batch.create({
        batchName,
        course,
        faculty,
        startDate,
        endDate,
        status: 'UPCOMING',
    })

    if (batch) {
        res.status(201).json({ success: true, data: batch })
    } else {
        res.status(400)
        throw new Error('Invalid batch data received')
    }
})

// @desc    Get all batches (Admin sees all, Faculty sees only theirs)
// @route   GET /api/batches
// @access  Private (Admin/Faculty)
const getBatches = asyncHandler(async (req, res) => {
    const userRole = (
        req.user?.role?.name ||
        req.user?.role ||
        ''
    ).toLowerCase()

    // RBAC: If faculty, filter by their specific user ID
    const query = userRole === 'faculty' ? { faculty: req.user._id } : {}

    const batches = await Batch.find(query)
        .populate('course', 'courseTitle category durationWeeks')
        .populate('faculty', 'firstName lastName email')
        .sort({ startDate: -1 })

    res.status(200).json({
        success: true,
        count: batches.length,
        data: batches,
    })
})

// @desc    Get single batch by ID
// @route   GET /api/batches/:id
// @access  Private (Admin/Faculty)
const getBatchById = asyncHandler(async (req, res) => {
    const batch = await Batch.findById(req.params.id)
        .populate('course', 'courseTitle fee')
        .populate('faculty', 'firstName lastName email')
        .populate({
            path: 'students',
            select: 'fullName email phone paymentStatus status paidAmount totalFee',
        })

    if (!batch) {
        res.status(404)
        throw new Error('Batch not found')
    }

    // RBAC: Prevent a faculty member from viewing another faculty's batch
    const userRole = (
        req.user?.role?.name ||
        req.user?.role ||
        ''
    ).toLowerCase()
    if (
        userRole === 'faculty' &&
        batch.faculty._id.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized to access this specific batch')
    }

    res.status(200).json({ success: true, data: batch })
})

// @desc    Add students to an existing batch
// @route   PUT /api/batches/:id/students
// @access  Private/Admin
const addStudentsToBatch = asyncHandler(async (req, res) => {
    const { studentIds } = req.body // Expects an array of student ObjectIds

    const batch = await Batch.findById(req.params.id)

    if (!batch) {
        res.status(404)
        throw new Error('Batch not found')
    }

    // Prevent duplicate students in the same batch using Set logic
    const currentStudentIds = batch.students.map((id) => id.toString())
    const newUniqueStudents = studentIds.filter(
        (id) => !currentStudentIds.includes(id.toString()),
    )

    if (newUniqueStudents.length === 0) {
        res.status(400)
        throw new Error('All provided students are already in this batch')
    }

    batch.students.push(...newUniqueStudents)

    // Automatically shift status to ACTIVE if it was UPCOMING and students are added
    if (batch.status === 'UPCOMING') {
        batch.status = 'ACTIVE'
    }

    await batch.save()

    // Optional but recommended: Update the student documents to reflect they are active
    await Student.updateMany(
        { _id: { $in: newUniqueStudents } },
        { $set: { status: 'ACTIVE' } },
    )

    const updatedBatch = await Batch.findById(req.params.id).populate(
        'students',
        'fullName email',
    )

    res.status(200).json({ success: true, data: updatedBatch })
})

// @desc    Update batch record details
// @route   PUT /api/batches/:id
// @access  Private/Admin
const updateBatch = asyncHandler(async (req, res) => {
    const { batchName, course, faculty, startDate, endDate, status } = req.body

    const batch = await Batch.findById(req.params.id)
    if (!batch) {
        res.status(404)
        throw new Error('Batch not found')
    }

    // Check name uniqueness if changed
    if (batchName && batchName !== batch.batchName) {
        const nameExists = await Batch.findOne({ batchName })
        if (nameExists) {
            res.status(400)
            throw new Error('A batch with this name already exists')
        }
    }

    batch.batchName = batchName || batch.batchName
    batch.course = course || batch.course
    batch.faculty = faculty || batch.faculty
    batch.startDate = startDate || batch.startDate
    batch.endDate = endDate !== undefined ? endDate : batch.endDate
    batch.status = status || batch.status

    const updatedBatch = await batch.save()

    const populatedBatch = await Batch.findById(updatedBatch._id)
        .populate('course', 'courseTitle category durationWeeks')
        .populate('faculty', 'firstName lastName email')

    res.status(200).json({ success: true, data: populatedBatch })
})

// Remember to export updateBatch in your export object at the bottom of the controller file:
export default {
    createBatch,
    getBatches,
    getBatchById,
    addStudentsToBatch,
    updateBatch,
}
