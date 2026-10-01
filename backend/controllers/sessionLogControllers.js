import asyncHandler from 'express-async-handler'
import SessionLog from '../models/sessionLogModel.js'
import Batch from '../models/batchModel.js'
import crypto from 'crypto'

// @desc    Create a new session log (Daily class memo) & generate tokens
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

	// --- NEW: Generate a unique WhatsApp feedback token for every attended student ---
	const feedbacks = (attendance || []).map((studentId) => ({
		student: studentId,
		feedbackToken: crypto.randomBytes(32).toString('hex'),
	}))

	const sessionLog = await SessionLog.create({
		batch: batchId,
		faculty: req.user._id,
		sessionDate: sessionDate || Date.now(),
		durationMinutes,
		topicsCovered,
		nextSessionPlan,
		attendance,
		studentFeedbacks: feedbacks, // Inject the tokens
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
		.populate('attendance', 'fullName email phone') // Populating phone for WhatsApp
		.populate('studentFeedbacks.student', 'fullName phone')
		.sort({ sessionDate: -1 })

	res.status(200).json({
		success: true,
		count: sessions.length,
		data: sessions,
	})
})

// @desc    Submit public student class feedback
// @route   POST /api/sessions/feedback/:token
// @access  Public
const submitClassFeedback = asyncHandler(async (req, res) => {
	const { token } = req.params
	const { rating, comments } = req.body

	// Find the session that contains this specific token
	const session = await SessionLog.findOne({
		'studentFeedbacks.feedbackToken': token,
	})

	if (!session) {
		res.status(404)
		throw new Error('Invalid feedback link.')
	}

	// Locate the specific student's feedback entry
	const feedbackEntry = session.studentFeedbacks.find(
		(f) => f.feedbackToken === token,
	)

	if (feedbackEntry.isSubmitted) {
		res.status(400)
		throw new Error('Feedback has already been submitted for this session.')
	}

	// Record the feedback
	feedbackEntry.rating = rating
	feedbackEntry.comments = comments
	feedbackEntry.isSubmitted = true
	feedbackEntry.submittedAt = Date.now()

	await session.save()

	res.status(200).json({
		success: true,
		message: 'Class feedback submitted successfully.',
	})
})

export default {
	createSessionLog,
	getBatchSessions,
	submitClassFeedback, // Export the new endpoint
}
