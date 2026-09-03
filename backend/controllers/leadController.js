import leadModel from '../models/leadModel.js'
import csv from 'csv-parser'
import { Readable } from 'stream'
import userModel from '../models/userModel.js'
import courseModel from '../models/courseModel.js'
import asyncHandler from 'express-async-handler'

// ==========================================
// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
// ==========================================
export const createLead = asyncHandler(async (req, res) => {
    const leadData = { ...req.body }

    // 1. Mandatory client validation
    if (!leadData.fullName || !leadData.phone) {
        res.status(400)
        throw new Error('Lead full name and phone number are required')
    }

    // 2. Ownership authorization: Non-admins cannot assign leads to others
    const roleName =
        req.user.role?.name?.toLowerCase() || req.user.role?.toLowerCase()
    if (roleName !== 'admin' && roleName !== 'manager') {
        leadData.assignedTo = req.user._id
    } else if (!leadData.assignedTo) {
        leadData.assignedTo = req.user._id
    }

    // 3. Prevent duplicate active leads
    const duplicateQuery = [{ phone: leadData.phone }]
    if (leadData.email) duplicateQuery.push({ email: leadData.email })

    const existingLead = await leadModel.findOne({ $or: duplicateQuery })
    if (existingLead) {
        res.status(400)
        throw new Error('A lead with this phone number or email already exists')
    }

    // 4. Persistence
    const lead = await leadModel.create(leadData)

    res.status(201).json({
        success: true,
        data: lead,
    })
})

// ==========================================
// @desc    Get all leads (Scoped by Role & Filters)
// @route   GET /api/leads
// @access  Private
// ==========================================
export const getLeads = asyncHandler(async (req, res) => {
    const { status, source, city, page = 1, limit = 1000 } = req.query

    const query = {}

    // 1. Resolve role name safely from middleware context
    const roleName = (req.user.role?.name || req.user.role || '').toLowerCase()
    const isAdmin = roleName === 'admin'

    // 2. Data Scoping: Non-admins can only see their own leads
    if (!isAdmin) {
        query.assignedTo = req.user._id
    }

    // 3. Optional Filters
    if (status) query.status = status
    if (source) query.source = source
    if (city) query.city = new RegExp(city, 'i')

    // 4. Pagination math
    const parsedPage = Math.max(1, parseInt(page, 10))
    const parsedLimit = Math.max(1, parseInt(limit, 10))
    const startIndex = (parsedPage - 1) * parsedLimit

    const total = await leadModel.countDocuments(query)

    // 5. Query execution
    const leads = await leadModel
        .find(query)
        .populate('interestedCourses', 'courseTitle fee category')
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(parsedLimit)

    res.status(200).json({
        success: true,
        count: leads.length,
        total,
        totalPages: Math.ceil(total / parsedLimit),
        currentPage: parsedPage,
        data: leads,
    })
})

// ==========================================
// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
// ==========================================
export const getLeadById = asyncHandler(async (req, res) => {
    const lead = await leadModel
        .findById(req.params.id)
        .populate('interestedCourses', 'courseTitle fee category')
        .populate('assignedTo', 'firstName lastName email')

    if (!lead) {
        res.status(404)
        throw new Error('Lead not found')
    }

    // 1. Resolve role cleanly
    const roleName = (req.user.role?.name || req.user.role || '').toLowerCase()
    const isAdmin = roleName === 'admin'

    // 2. Ownership check: Non-admins cannot inspect leads assigned to others
    const leadOwnerId = lead.assignedTo?._id?.toString()
    if (!isAdmin && leadOwnerId !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Not authorized to view this lead')
    }

    res.status(200).json({
        success: true,
        data: lead,
    })
})

// ==========================================
// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
// ==========================================
export const updateLead = asyncHandler(async (req, res) => {
    const lead = await leadModel.findById(req.params.id)

    if (!lead) {
        res.status(404)
        throw new Error('Lead not found')
    }

    // 1. Resolve role cleanly
    const roleName = (req.user.role?.name || req.user.role || '').toLowerCase()
    const isAdmin = roleName === 'admin'

    // 2. Ownership check: User must be an admin OR the current assignee
    const isOwner = lead.assignedTo?.toString() === req.user._id.toString()
    if (!isAdmin && !isOwner) {
        res.status(403)
        throw new Error('Not authorized to update this lead')
    }

    // 3. Security Sanitize: Strip unauthorized fields
    const updates = { ...req.body }
    if (!isAdmin) {
        delete updates.assignedTo // Non-admins cannot transfer leads
    }

    // 4. Persistence with validation
    const updatedLead = await leadModel
        .findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        })
        .populate('interestedCourses', 'courseTitle fee category')
        .populate('assignedTo', 'firstName lastName email')

    res.status(200).json({
        success: true,
        data: updatedLead,
    })
})

// ==========================================
// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
// ==========================================
export const deleteLead = asyncHandler(async (req, res) => {
    // 1. Role verification: strictly Admins only
    const roleName = (req.user.role?.name || req.user.role || '').toLowerCase()
    if (roleName !== 'admin') {
        res.status(403)
        throw new Error('Access denied. Only administrators can delete leads.')
    }

    // 2. Locate and delete the document in one operation
    const lead = await leadModel.findByIdAndDelete(req.params.id)

    if (!lead) {
        res.status(404)
        throw new Error('Lead not found')
    }

    // 3. Return the deleted id for immediate React state reconciliation
    res.status(200).json({
        success: true,
        message: 'Lead permanently removed',
        id: req.params.id,
    })
})

// =======================================
// @desc    Import Leads from CSV
// @route   POST /api/leads/import
// @access  Private
// =======================================
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
