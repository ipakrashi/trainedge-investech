import leadActivityModel from '../models/leadActivityModel.js'
import leadModel from '../models/leadModel.js'

// @desc    Add a new activity/interaction to a lead
// @route   POST /api/lead-activities
// @access  Private
export const createActivity = async (req, res) => {
    try {
        const { lead, type, summary, details } = req.body

        // Verify the associated lead exists
        const existingLead = await leadModel.findById(lead)
        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: 'Associated lead not found.',
            })
        }

        // Security check: Only Admins or the assigned counselor can add activities to this lead
        if (
            req.user.role !== 'admin' &&
            existingLead.assignedTo.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add activities to this lead.',
            })
        }

        const activity = await leadActivityModel.create({
            lead,
            performedBy: req.user._id, // Automatically assign the logged-in user
            type,
            summary,
            details,
        })

        res.status(201).json({
            success: true,
            data: activity,
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

// @desc    Get all activities timeline for a specific lead
// @route   GET /api/activities/lead/:leadId
// @access  Private
export const getActivitiesByLead = async (req, res) => {
    try {
        // Find the lead to check authorization
        const lead = await leadModel.findById(req.params.leadId)

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: 'Lead not found.' })
        }

        if (
            req.user.role !== 'admin' &&
            lead.assignedTo.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this lead's activities.",
            })
        }

        const activities = await leadActivityModel
            .find({ lead: req.params.leadId })
            .populate('performedBy', 'firstName lastName email role')
            .sort({ createdAt: -1 }) // Newest activities first for the timeline view

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities,
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid lead ID format.' })
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        })
    }
}

// @desc    Update a specific activity (e.g., editing a note)
// @route   PUT /api/activities/:id
// @access  Private
export const updateActivity = async (req, res) => {
    try {
        let activity = await leadActivityModel.findById(req.params.id)

        if (!activity) {
            return res
                .status(404)
                .json({ success: false, message: 'Activity not found.' })
        }

        // Security check: Only the user who created the activity or an Admin can edit it
        if (
            req.user.role !== 'admin' &&
            activity.performedBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this activity.',
            })
        }

        // Prevent changing the associated lead or author during an update
        const { lead, performedBy, ...updateData } = req.body

        activity = await leadActivityModel
            .findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            })
            .populate('performedBy', 'name')

        res.status(200).json({
            success: true,
            data: activity,
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

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
export const deleteActivity = async (req, res) => {
    try {
        const activity = await leadActivityModel.findById(req.params.id)

        if (!activity) {
            return res
                .status(404)
                .json({ success: false, message: 'Activity not found.' })
        }

        // Security check: Only Admins or the original author can delete an activity
        if (
            req.user.role !== 'admin' &&
            activity.performedBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this activity.',
            })
        }

        await leadActivityModel.findByIdAndDelete(req.params.id)

        res.status(200).json({
            success: true,
            message: 'Activity removed successfully.',
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid activity ID format.',
            })
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        })
    }
}
