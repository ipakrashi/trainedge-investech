import asyncHandler from 'express-async-handler'
import SessionLog from '../models/sessionLogModel.js'
import Batch from '../models/batchModel.js'

// @desc    Create a new session log (Daily class memo)
// @route   POST /api/sessions
// @access  Private (Faculty/Admin)
const createSessionLog = asyncHandler(async (req, res) => {
    const {
        batchId,
        sessionDate,
        durationMinutes,
        topicsCovered,
        nextSessionPlan,
        attendance,
    } = req.body

    const batch = await Batch.findById(batchId)
    if (!batch) {
        res.status(404)
        throw new Error('Batch not found')
    }

    // RBAC: Ensure only the assigned faculty (or an Admin) can log sessions for this batch
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
        throw new Error('You are not authorized to log sessions for this batch')
    }

    const sessionLog = await SessionLog.create({
        batch: batchId,
        faculty: req.user._id, // Set the creator as the currently logged-in faculty
        sessionDate: sessionDate || Date.now(),
        durationMinutes,
        topicsCovered,
        nextSessionPlan,
        attendance, // Array of student ObjectIds who were present
    })

    res.status(201).json({ success: true, data: sessionLog })
})

// @desc    Get all session logs for a specific batch
// @route   GET /api/sessions/batch/:batchId
// @access  Private (Faculty/Admin)
const getBatchSessions = asyncHandler(async (req, res) => {
    const { batchId } = req.params

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
        throw new Error(
            "You are not authorized to view this batch's session logs",
        )
    }

    const sessions = await SessionLog.find({ batch: batchId })
        .populate('faculty', 'firstName lastName')
        .populate('attendance', 'fullName email')
        .sort({ sessionDate: -1 }) // Newest logs first

    res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions,
    })
})

export default {
    createSessionLog,
    getBatchSessions,
}
