import leadModel from '../models/leadModel.js'
import csv from 'csv-parser'
import { Readable } from 'stream'
import userModel from '../models/userModel.js'
import courseModel from '../models/courseModel.js'
import asyncHandler from 'express-async-handler'

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
        // Keeping the limit at 1000 so the frontend table loads all leads
        const { status, source, city, page = 1, limit = 1000 } = req.query

        let query = {}

        // 1. Populate the role reference to read the string value
        await req.user.populate('role')

        // 2. Extract the role string (handles different common schema field names like 'name' or 'roleName')
        const roleStr =
            req.user.role?.name || req.user.role?.roleName || req.user.role
        const isAdmin =
            typeof roleStr === 'string' && roleStr.toLowerCase() === 'admin'

        // 3. Apply the ownership filter ONLY if the user is NOT an admin
        if (!isAdmin) {
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
            // Updated to use firstName and lastName based on your userSchema
            .populate('assignedTo', 'firstName lastName email')
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

// @desc    Import Leads from CSV
// @route   POST /api/leads/import
// @access  Private
export const importLeadsCSV = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400)
        throw new Error('Please upload a valid CSV file')
    }

    const results = []
    const bufferStream = Readable.from(req.file.buffer)

    bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            let importedCount = 0
            let errorsCount = 0

            for (const row of results) {
                try {
                    const cleanRow = {}
                    Object.keys(row).forEach((k) => {
                        // Strip invisible BOM characters and normalize header keys
                        const cleanKey = k
                            .replace(/^\ufeff/, '')
                            .trim()
                            .toLowerCase()
                        cleanRow[cleanKey] = row[k]?.trim()
                    })

                    // 1. Resolve Assigned User (Flexible fallback)
                    let assignedUserId = req.user._id
                    const rawAssignee =
                        cleanRow['assignedto'] || cleanRow['assignedemail']
                    if (rawAssignee) {
                        if (rawAssignee.length === 24) {
                            assignedUserId = rawAssignee
                        } else {
                            const user = await userModel.findOne({
                                $or: [
                                    {
                                        email: {
                                            $regex: new RegExp(
                                                `^${rawAssignee}$`,
                                                'i',
                                            ),
                                        },
                                    },
                                    {
                                        firstName: {
                                            $regex: new RegExp(
                                                `^${rawAssignee}$`,
                                                'i',
                                            ),
                                        },
                                    },
                                ],
                            })
                            if (user) assignedUserId = user._id
                        }
                    }

                    // 2. Resolve Interested Courses (Checks title, courseTitle, or name)
                    let courseIds = []
                    const rawCourses =
                        cleanRow['interestedcourses'] || cleanRow['coursetitle']
                    if (rawCourses) {
                        const items = rawCourses
                            .split(',')
                            .map((i) => i.trim())
                            .filter(Boolean)
                        for (const item of items) {
                            const cleanId = item
                                .replace(/ObjectId\(|\)|['"]/g, '')
                                .trim()
                            if (cleanId.length === 24) {
                                courseIds.push(cleanId)
                            } else {
                                const course = await courseModel.findOne({
                                    $or: [
                                        {
                                            title: {
                                                $regex: new RegExp(
                                                    `^${item}$`,
                                                    'i',
                                                ),
                                            },
                                        },
                                        {
                                            courseTitle: {
                                                $regex: new RegExp(
                                                    `^${item}$`,
                                                    'i',
                                                ),
                                            },
                                        },
                                        {
                                            name: {
                                                $regex: new RegExp(
                                                    `^${item}$`,
                                                    'i',
                                                ),
                                            },
                                        },
                                    ],
                                })
                                if (course) courseIds.push(course._id)
                            }
                        }
                    }

                    // 3. Handle Tags Array
                    let parsedTags = []
                    if (cleanRow['tags']) {
                        parsedTags = cleanRow['tags']
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                    }

                    const leadData = {
                        fullName:
                            cleanRow['fullname'] ||
                            cleanRow['name'] ||
                            'Unknown Lead',
                        email: cleanRow['email'],
                        phone: cleanRow['phone'],
                        city: cleanRow['city'],
                        status: (cleanRow['status'] || 'NEW').toUpperCase(),
                        source: (cleanRow['source'] || 'OTHER').toUpperCase(),
                        estimatedValue: Number(cleanRow['estimatedvalue'] || 0),
                        experienceLevel:
                            cleanRow['experiencelevel'] || 'BEGINNER',
                        tags: parsedTags,
                        assignedTo: assignedUserId,
                        interestedCourses: courseIds,
                    }

                    if (cleanRow['nextfollowupdate'])
                        leadData.nextFollowUpDate = new Date(
                            cleanRow['nextfollowupdate'],
                        )
                    if (cleanRow['createdat'])
                        leadData.createdAt = new Date(cleanRow['createdat'])
                    if (cleanRow['updatedat'])
                        leadData.updatedAt = new Date(cleanRow['updatedat'])

                    await leadModel.create(leadData)
                    importedCount++
                } catch (err) {
                    console.error('Row import error:', err.message)
                    errorsCount++
                }
            }

            res.status(200).json({
                success: true,
                message: `Import completed. Successfully imported: ${importedCount}, Errors/Skipped: ${errorsCount}`,
            })
        })
})
