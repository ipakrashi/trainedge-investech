import leadActivityModel from '../models/leadActivityModel.js'
import leadModel from '../models/leadModel.js'

// Helper function to safely check if a user is an admin
const checkIsAdmin = (user) => {
    if (!user || !user.role) return false
    const roleName = user.role.name || user.role
    return roleName.toString().toLowerCase() === 'admin'
}

// @desc    Add a new activity/interaction to a lead and optionally update follow-up date
// @route   POST /api/lead-activities
// @access  Private
export const createActivity = async (req, res) => {
    try {
        const { lead, type, summary, details, nextFollowUpDate } = req.body

        // Verify the associated lead exists
        const existingLead = await leadModel.findById(lead)
        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: 'Associated lead not found.',
            })
        }

        const isAdmin = checkIsAdmin(req.user)

        // Security check: Only Admins or the assigned counselor can add activities to this lead
        if (
            !isAdmin &&
            existingLead.assignedTo.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add activities to this lead.',
            })
        }

        const activity = await leadActivityModel.create({
            lead,
            performedBy: req.user._id,
            type,
            summary,
            details,
        })

        // If a next follow-up date was provided directly from the drawer, update the lead record simultaneously
        if (nextFollowUpDate) {
            await leadModel.findByIdAndUpdate(lead, {
                nextFollowUpDate: new Date(nextFollowUpDate),
            })
        }

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
        const lead = await leadModel.findById(req.params.leadId)

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: 'Lead not found.' })
        }

        const isAdmin = checkIsAdmin(req.user)

        if (
            !isAdmin &&
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
            .sort({ createdAt: -1 })

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

// @desc    Update a specific activity
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

        const isAdmin = checkIsAdmin(req.user)

        if (
            !isAdmin &&
            activity.performedBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this activity.',
            })
        }

        const { lead, performedBy, ...updateData } = req.body

        activity = await leadActivityModel
            .findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            })
            .populate('performedBy', 'firstName lastName')

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

        const isAdmin = checkIsAdmin(req.user)

        if (
            !isAdmin &&
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
