// server/controllers/demoController.js
import demoMasterModel from '../models/demoMasterModel.js'
import demoSessionModel from '../models/demoSessionModel.js'
import leadActivityModel from '../models/leadActivityModel.js'
import leadModel from '../models/leadModel.js'
import userModel from '../models/userModel.js'
import asyncHandler from 'express-async-handler'

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

    const session = await demoSessionModel.findByIdAndUpdate(
        req.params.id,
        { status: 'COMPLETED', rating, clientComments },
        { new: true },
    )

    if (!session) {
        res.status(404)
        throw new Error('Demo Session not found')
    }

    await leadActivityModel.create({
        lead: session.lead,
        performedBy: req.user._id,
        type: 'NOTE',
        summary: `Demo Completed & Rated (${rating}/5). Client remarks: ${clientComments}`,
    })

    await leadModel.findByIdAndUpdate(session.lead, { status: 'DEMO_ATTENDED' })

    res.status(200).json({ success: true, data: session })
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
