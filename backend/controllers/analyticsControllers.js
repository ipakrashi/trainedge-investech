// server/controllers/analyticsController.js
import leadModel from '../models/leadModel.js'
import studentModel from '../models/studentModel.js'
import userModel from '../models/userModel.js'
import paymentModel from '../models/paymentModel.js'
import batchModel from '../models/batchModel.js' // <-- NEW IMPORT
import asyncHandler from 'express-async-handler'

// @desc    Get role-scoped analytics dashboard data
// @route   GET /api/analytics
// @access  Private
export const getAnalyticsData = asyncHandler(async (req, res) => {
    const roleName = (req.user.role?.name || req.user.role || '').toLowerCase()
    const isAdmin = roleName === 'admin'
    const isFaculty = roleName === 'faculty'
    const isSales = roleName === 'sales'
    const isAccounts = roleName === 'accounts'

    // 1. FACULTY ANALYTICS VIEW - Purely Academic (No Financials)
    if (isFaculty) {
        // Fetch students and convert to plain JS objects (.lean()) so we can inject batch data
        const students = await studentModel
            .find({ assignedFaculty: req.user._id })
            .populate('enrolledCourses', 'courseTitle fee')
            .lean()

        // Fetch all batches assigned to this faculty member
        const batches = await batchModel.find({ faculty: req.user._id }).lean()

        const totalStudents = students.length
        const activeStudents = students.filter(
            (s) => s.status === 'ACTIVE',
        ).length

        // Map the respective cohorts/batches into each student's object
        const studentsWithBatches = students.map((student) => {
            const studentBatches = batches.filter((b) =>
                b.students?.some(
                    (sId) => sId.toString() === student._id.toString(),
                ),
            )
            return {
                ...student,
                batches: studentBatches,
            }
        })

        return res.status(200).json({
            success: true,
            role: 'faculty',
            data: {
                totalStudents,
                activeStudents,
                studentsList: studentsWithBatches,
            },
        })
    }

    // 2. ACCOUNTS / FINANCE ANALYTICS VIEW
    if (isAccounts) {
        const payments = await paymentModel.find()
        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const todayCollected = payments
            .filter((p) => new Date(p.paymentDate) >= startOfDay)
            .reduce((sum, p) => sum + p.amount, 0)

        return res.status(200).json({
            success: true,
            role: 'accounts',
            data: {
                totalCollected,
                todayCollected,
                transactionCount: payments.length,
            },
        })
    }

    // 3. SALES / COUNSELOR ANALYTICS VIEW
    if (isSales) {
        const leads = await leadModel
            .find({ assignedTo: req.user._id })
            .populate('interestedCourses', 'courseTitle fee')
            .sort({ createdAt: -1 })

        const totalLeads = leads.length
        const activePipeline = leads
            .filter((l) => !['LOST', 'JUNK', 'ENROLLED'].includes(l.status))
            .reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

        const enrolledLeads = leads.filter(
            (l) => l.status === 'ENROLLED',
        ).length
        const conversionRate =
            totalLeads === 0
                ? 0
                : ((enrolledLeads / totalLeads) * 100).toFixed(1)

        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const newThisWeek = leads.filter(
            (l) => new Date(l.createdAt) > oneWeekAgo,
        ).length

        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)
        const pendingFollowUps = leads.filter((l) => {
            if (!l.nextFollowUpDate) return false
            if (['LOST', 'JUNK', 'ENROLLED'].includes(l.status)) return false
            return new Date(l.nextFollowUpDate) <= endOfToday
        })

        return res.status(200).json({
            success: true,
            role: 'sales',
            data: {
                totalLeads,
                activePipeline,
                conversionRate,
                newThisWeek,
                recentLeads: leads.slice(0, 5),
                pendingFollowUps,
            },
        })
    }

    // 4. ADMIN GLOBAL OVERSIGHT VIEW
    if (isAdmin) {
        // -- Sales Aggregation --
        const allLeads = await leadModel
            .find({})
            .populate('interestedCourses', 'courseTitle fee')
            .populate('assignedTo', 'firstName lastName email')

        const totalLeads = allLeads.length
        const activePipeline = allLeads
            .filter((l) => !['LOST', 'JUNK', 'ENROLLED'].includes(l.status))
            .reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

        const enrolledLeads = allLeads.filter(
            (l) => l.status === 'ENROLLED',
        ).length
        const conversionRate =
            totalLeads === 0
                ? 0
                : ((enrolledLeads / totalLeads) * 100).toFixed(1)

        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const newThisWeek = allLeads.filter(
            (l) => new Date(l.createdAt) > oneWeekAgo,
        ).length

        // Funnel & Sources
        const statusGroups = {}
        allLeads.forEach((l) => {
            statusGroups[l.status] = (statusGroups[l.status] || 0) + 1
        })
        const funnelData = Object.keys(statusGroups).map((status) => ({
            label: status,
            count: statusGroups[status],
            rate: totalLeads
                ? ((statusGroups[status] / totalLeads) * 100).toFixed(1)
                : 0,
        }))

        const sourceMap = {}
        allLeads.forEach((l) => {
            const src = l.source || 'OTHER'
            if (!sourceMap[src])
                sourceMap[src] = { count: 0, revenue: 0, enrolled: 0 }
            sourceMap[src].count += 1
            if (l.status === 'ENROLLED') {
                sourceMap[src].enrolled += 1
                sourceMap[src].revenue += l.estimatedValue || 0
            }
        })

        const sources = Object.keys(sourceMap).map((name) => ({
            name,
            totalLeads: sourceMap[name].count,
            revenue: sourceMap[name].revenue,
            conversionRate: sourceMap[name].count
                ? (
                      (sourceMap[name].enrolled / sourceMap[name].count) *
                      100
                  ).toFixed(1)
                : 0,
            percentage: totalLeads
                ? ((sourceMap[name].count / totalLeads) * 100).toFixed(1)
                : 0,
        }))

        // -- User Aggregation --
        const users = await userModel.find({}).populate('role')
        const totalUsers = users.length
        const activeUsers = users.filter((u) => u.isActive).length

        const salesReps = users.filter((u) => {
            const r = (u.role?.name || u.role || '').toLowerCase()
            return ['sales', 'manager', 'counselor', 'admin'].includes(r)
        })

        const teamData = salesReps.map((rep) => {
            const repLeads = allLeads.filter(
                (l) => l.assignedTo?._id?.toString() === rep._id.toString(),
            )
            const assigned = repLeads.length
            const closed = repLeads.filter(
                (l) => l.status === 'ENROLLED',
            ).length
            const revenue = repLeads
                .filter((l) => l.status === 'ENROLLED')
                .reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
            const winRate =
                assigned > 0 ? ((closed / assigned) * 100).toFixed(1) : 0
            return {
                id: rep._id,
                name: `${rep.firstName} ${rep.lastName}`,
                role: rep.role?.name || 'Staff',
                assigned,
                closed,
                winRate: Number(winRate),
                revenue,
            }
        })

        // -- Finance Aggregation --
        const payments = await paymentModel.find()
        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const todayCollected = payments
            .filter((p) => new Date(p.paymentDate) >= startOfDay)
            .reduce((sum, p) => sum + p.amount, 0)

        // -- Academic Aggregation --
        const students = await studentModel.find()
        const totalStudents = students.length
        const activeStudents = students.filter(
            (s) => s.status === 'ACTIVE',
        ).length
        let expectedRevenue = 0
        students.forEach((s) => (expectedRevenue += s.totalFee || 0))

        return res.status(200).json({
            success: true,
            role: 'admin',
            data: {
                // Sales Base
                totalLeads,
                activePipeline,
                conversionRate,
                newThisWeek,
                recentLeads: allLeads.slice(0, 5),
                funnelData,
                sources,
                teamData,
                // Finance & Academic Global Expansions
                financeStats: {
                    totalCollected,
                    todayCollected,
                    transactionCount: payments.length,
                },
                academicStats: {
                    totalStudents,
                    activeStudents,
                    expectedRevenue,
                },
                systemStats: { totalUsers, activeUsers },
            },
        })
    }

    res.status(403).json({ success: false, message: 'Invalid role access' })
})
