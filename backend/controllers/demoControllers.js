// server/controllers/demoController.js
import demoMasterModel from '../models/demoMasterModel.js'
import demoSessionModel from '../models/demoSessionModel.js'
import leadActivityModel from '../models/leadActivityModel.js'
import leadModel from '../models/leadModel.js'
import userModel from '../models/userModel.js'
import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'

// Helper: Safely check admin status
const checkIsAdmin = async (userId) => {
	const user = await userModel.findById(userId).populate('role')
	if (!user || !user.role) return false
	const roleName = user.role.name || user.role
	return roleName.toString().toLowerCase() === 'admin'
}

// --- MASTER DEMO CATALOG APIs ---
export const getActiveDemoMasters = asyncHandler(async (req, res) => {
	const demos = await demoMasterModel
		.find({ isActive: true })
		.sort({ title: 1 })
	res.status(200).json({ success: true, data: demos })
})

export const createDemoMaster = asyncHandler(async (req, res) => {
	const isAdmin = await checkIsAdmin(req.user._id)
	if (!isAdmin) {
		res.status(403)
		throw new Error('Only administrators can manage the demo catalog.')
	}
	const demo = await demoMasterModel.create(req.body)
	res.status(201).json({ success: true, data: demo })
})

// --- DEMO SCHEDULING & EXECUTION APIs ---
export const scheduleDemo = asyncHandler(async (req, res) => {
	const {
		leadId,
		demoMasterId,
		assignedTo,
		scheduledDate,
		summary,
		nextFollowUpDate,
	} = req.body

	const session = await demoSessionModel.create({
		lead: leadId,
		demoMaster: demoMasterId,
		assignedTo: assignedTo || req.user._id,
		scheduledDate: new Date(scheduledDate),
		createdBy: req.user._id,
	})

	await leadActivityModel.create({
		lead: leadId,
		performedBy: req.user._id,
		type: 'DEMO',
		summary: summary || 'Demo Scheduled',
		details: { demoSessionId: session._id },
	})

	const updateData = { status: 'DEMO_SCHEDULED' }
	if (nextFollowUpDate)
		updateData.nextFollowUpDate = new Date(nextFollowUpDate)

	await leadModel.findByIdAndUpdate(leadId, updateData)

	res.status(201).json({ success: true, data: session })
})

export const completeDemo = asyncHandler(async (req, res) => {
	const { rating, clientComments } = req.body
	const feedbackToken = crypto.randomBytes(32).toString('hex')

	const session = await demoSessionModel
		.findByIdAndUpdate(
			req.params.id,
			{ status: 'COMPLETED', rating, clientComments, feedbackToken },
			{ new: true },
		)
		.populate('lead', 'firstName fullName email')

	if (!session) {
		res.status(404)
		throw new Error('Demo Session not found')
	}

	await leadActivityModel.create({
		lead: session.lead._id,
		performedBy: req.user._id,
		type: 'NOTE',
		summary: `Demo Marked Completed. Feedback link dispatched to client.`,
	})

	await leadModel.findByIdAndUpdate(session.lead._id, {
		status: 'DEMO_ATTENDED',
	})

	// Send Feedback Email
	const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/feedback/${feedbackToken}`
	const emailMessage = `
        <h2>Hi ${session.lead.firstName || session.lead.fullName},</h2>
        <p>Thank you for attending the demo session today!</p>
        <p>We would love to hear your feedback so we can continue to improve.</p>
        <br/>
        <a href="${feedbackUrl}" style="padding:10px 20px; background-color:#2563eb; color:white; text-decoration:none; border-radius:5px;">Click Here to Provide Feedback</a>
        <br/><br/>
        <p><small>This link is unique to your session and can only be used once.</small></p>
    `

	try {
		await sendEmail({
			to: session.lead.email,
			subject: 'How was your Demo Session?',
			html: emailMessage,
		})
	} catch (err) {
		console.error('Feedback email sending failed:', err)
	}

	res.status(200).json({ success: true, data: session })
})

// ==========================================
// @desc    Submit public client feedback
// @route   POST /api/demos/feedback/:token
// @access  Public
// ==========================================
export const submitClientFeedback = asyncHandler(async (req, res) => {
	const { token } = req.params
	const { rating, clientComments } = req.body

	const session = await demoSessionModel.findOne({ feedbackToken: token })

	if (!session) {
		res.status(404)
		throw new Error('Invalid feedback link.')
	}

	if (session.feedbackTokenUsed) {
		res.status(400)
		throw new Error('Feedback has already been submitted for this session.')
	}

	session.rating = rating
	session.clientComments = clientComments
	session.feedbackTokenUsed = true
	await session.save()

	// Notify Sales Counselor via Activity Timeline
	await leadActivityModel.create({
		lead: session.lead,
		performedBy: session.assignedTo, // Proxying the assignment to avoid null errors
		type: 'NOTE',
		summary: `⭐ Client Feedback Received: ${rating}/5 Stars. Comments: "${clientComments || 'None provided'}"`,
		details: { demoSessionId: session._id },
	})

	res.status(200).json({
		success: true,
		message: 'Feedback submitted successfully.',
	})
})

// --- FLEXIBLE CALENDAR & REPORTING API ---
export const getDemos = asyncHandler(async (req, res) => {
	const { status, assignedTo, startDate, endDate } = req.query
	const isAdmin = await checkIsAdmin(req.user._id)

	const query = {}

	// 1. Role-based scoping
	if (!isAdmin) {
		query.assignedTo = req.user._id
	} else if (assignedTo && assignedTo !== 'All') {
		query.assignedTo = assignedTo
	}

	// 2. Status Filtering
	if (status && status !== 'All') {
		query.status = status
	}

	// 3. Date Range Filtering
	if (startDate || endDate) {
		query.scheduledDate = {}
		if (startDate) query.scheduledDate.$gte = new Date(startDate)
		if (endDate) {
			const end = new Date(endDate)
			end.setHours(23, 59, 59, 999)
			query.scheduledDate.$lte = end
		}
	}

	const demos = await demoSessionModel
		.find(query)
		.populate('lead', 'fullName email phone status')
		.populate('demoMaster', 'title durationMinutes')
		.populate('assignedTo', 'firstName lastName')
		.sort({ scheduledDate: 1 })

	res.status(200).json({ success: true, data: demos })
})

export const rescheduleDemo = asyncHandler(async (req, res) => {
	const { newDate, assignedTo, reason } = req.body

	const session = await demoSessionModel.findById(req.params.id)

	if (!session) {
		res.status(404)
		throw new Error('Demo Session not found')
	}

	const oldDateObj = new Date(session.scheduledDate)
	const newDateObj = new Date(newDate) // Correct absolute time from frontend

	session.scheduledDate = newDateObj
	if (assignedTo) session.assignedTo = assignedTo
	await session.save()

	// FIX: Enforce IST specifically for the text log regardless of server location
	const oldDateStr = oldDateObj.toLocaleString('en-IN', {
		timeZone: 'Asia/Kolkata',
		dateStyle: 'short',
		timeStyle: 'short',
	})
	const newDateStr = newDateObj.toLocaleString('en-IN', {
		timeZone: 'Asia/Kolkata',
		dateStyle: 'short',
		timeStyle: 'short',
	})

	await leadActivityModel.create({
		lead: session.lead,
		performedBy: req.user._id,
		type: 'NOTE',
		summary: `🗓️ Demo Rescheduled from ${oldDateStr} to ${newDateStr}. \nReason: ${reason}`,
		details: { demoSessionId: session._id },
	})

	await leadModel.findByIdAndUpdate(session.lead, {
		nextFollowUpDate: session.scheduledDate,
	})

	res.status(200).json({ success: true, data: session })
})
