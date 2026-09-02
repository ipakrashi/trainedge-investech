import leadModel from '../models/leadModel.js'

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
export const createLead = async (req, res) => {
    try {
        const leadData = { ...req.body }

        // Default to logged-in user if no assignee is provided
        if (!leadData.assignedTo) {
            leadData.assignedTo = req.user._id
        }

        const lead = await leadModel.create(leadData)

        res.status(201).json({
            success: true,
            data: lead,
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(
                (val) => val.message,
            )
            return res
                .status(400)
                .json({ success: false, message: messages.join(', ') })
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        })
    }
}

// @desc    Get all leads with filtering and pagination
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req, res) => {
    try {
        const { status, source, city, page = 1, limit = 10 } = req.query

        let query = {}

        if (req.user.role !== 'admin') {
            query.assignedTo = req.user._id
        }

        if (status) query.status = status
        if (source) query.source = source
        if (city) query.city = new RegExp(city, 'i') // Case-insensitive search

        // Pagination setup
        const startIndex = (page - 1) * limit
        const total = await leadModel.countDocuments(query)

        const leads = await leadModel
            .find(query)
            .populate('interestedCourses', 'courseTitle fee category')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(parseInt(limit))

        res.status(200).json({
            success: true,
            count: leads.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: leads,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        })
    }
}

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Private
export const getLeadById = async (req, res) => {
    try {
        const lead = await leadModel
            .findById(req.params.id)
            .populate('interestedCourses', 'courseTitle fee category')
            .populate('assignedTo', 'name email')

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: 'Lead not found' })
        }

        if (
            req.user.role !== 'admin' &&
            lead.assignedTo._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this lead',
            })
        }

        res.status(200).json({ success: true, data: lead })
    } catch (error) {
        if (error.name === 'CastError') {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid lead ID format' })
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        })
    }
}

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req, res) => {
    try {
        let lead = await leadModel.findById(req.params.id)

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: 'Lead not found' })
        }

        if (
            req.user.role !== 'admin' &&
            lead.assignedTo.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this lead',
            })
        }

        // Prevent non-admins from changing the assigned user or lead score
        const updates = { ...req.body }
        if (req.user.role !== 'admin') {
            delete updates.assignedTo
            delete updates.leadScore
        }

        lead = await leadModel
            .findByIdAndUpdate(req.params.id, updates, {
                new: true,
                runValidators: true,
            })
            .populate('interestedCourses', 'courseTitle category')

        res.status(200).json({ success: true, data: lead })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(
                (val) => val.message,
            )
            return res
                .status(400)
                .json({ success: false, message: messages.join(', ') })
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        })
    }
}

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin Only)
export const deleteLead = async (req, res) => {
    // Controller remains the same, ensure role check is handled in the route middleware
    try {
        const lead = await leadModel.findByIdAndDelete(req.params.id)

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: 'Lead not found' })
        }

        res.status(200).json({
            success: true,
            message: 'Lead removed successfully',
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid lead ID format' })
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        })
    }
}
import userModel from '../models/userModel.js'
