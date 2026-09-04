// src/pages/Reports.jsx
import { useState, useEffect, useMemo } from 'react'
import {
    FiDollarSign,
    FiTrendingUp,
    FiTarget,
    FiAward,
    FiDownload,
    FiCreditCard,
    FiBook,
} from 'react-icons/fi'
import api from '../api/axios'
import StatCard from '../components/common/StatCard'
import ConversionFunnel from '../components/reports/ConversionFunnel'
import SourceBreakdown from '../components/reports/SourceBreakdown'
import RepPerformanceTable from '../components/reports/RepPerformanceTable'

const Reports = () => {
    // 1. Role Initialization
    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null
    const userRole = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()

    const isAdmin = userRole === 'admin'
    const isSales = userRole === 'sales'
    const isAccounts = userRole === 'accounts'

    const defaultTab = isSales ? 'sales' : 'finance'

    const [activeTab, setActiveTab] = useState(defaultTab)
    const [timeRange, setTimeRange] = useState('30d')

    const [allLeads, setAllLeads] = useState([])
    const [allPayments, setAllPayments] = useState([])
    const [allStudents, setAllStudents] = useState([]) // New state for course aggregations

    const [isLoading, setIsLoading] = useState(true)

    // 2. Safely parallelize independent payload requests
    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true)
            try {
                // Determine which APIs to fire based on RBAC to prevent 403s
                const [leadsRes, paymentsRes, studentsRes] =
                    await Promise.allSettled([
                        isAdmin || isSales
                            ? api.get('/leads?limit=5000')
                            : Promise.resolve({ data: { data: [] } }),
                        isAdmin || isAccounts
                            ? api.get('/payments')
                            : Promise.resolve({ data: { data: [] } }),
                        isAdmin
                            ? api.get('/students?limit=5000')
                            : Promise.resolve({ data: { data: [] } }),
                    ])

                if (isAdmin || isSales)
                    setAllLeads(leadsRes.value?.data?.data || [])
                if (isAdmin || isAccounts)
                    setAllPayments(paymentsRes.value?.data?.data || [])
                if (isAdmin) setAllStudents(studentsRes.value?.data?.data || [])
            } catch (error) {
                console.error('Failed to fetch reporting data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllData()
    }, [isAdmin, isSales, isAccounts])

    // 3. Process Sales Data
    const { filteredLeads, salesReportData } = useMemo(() => {
        const now = new Date()
        const filtered = allLeads.filter((lead) => {
            if (timeRange === 'all') return true
            const daysDiff =
                (now - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24)
            if (timeRange === '30d') return daysDiff <= 30
            if (timeRange === '90d') return daysDiff <= 90
            if (timeRange === '180d') return daysDiff <= 180
            if (timeRange === '1y') return daysDiff <= 365
            return true
        })

        const totalLeads = filtered.length
        const wonLeads = filtered.filter((l) => l.status === 'ENROLLED')
        const wonRevenue = wonLeads.reduce(
            (sum, l) => sum + (l.estimatedValue || 0),
            0,
        )
        const winRate =
            totalLeads > 0
                ? ((wonLeads.length / totalLeads) * 100).toFixed(1)
                : 0
        const avgDealSize =
            wonLeads.length > 0 ? wonRevenue / wonLeads.length : 0

        const cycleDaysSum = wonLeads.reduce(
            (sum, l) =>
                sum +
                (new Date(l.updatedAt) - new Date(l.createdAt)) /
                    (1000 * 60 * 60 * 24),
            0,
        )
        const avgCycleDays =
            wonLeads.length > 0
                ? (cycleDaysSum / wonLeads.length).toFixed(1)
                : 0

        const contactedCount = filtered.filter(
            (l) => !['NEW', 'JUNK'].includes(l.status),
        ).length
        const qualifiedCount = filtered.filter((l) =>
            [
                'QUALIFIED',
                'DEMO_SCHEDULED',
                'DEMO_ATTENDED',
                'ENROLLED',
            ].includes(l.status),
        ).length
        const demoCount = filtered.filter((l) =>
            ['DEMO_SCHEDULED', 'DEMO_ATTENDED', 'ENROLLED'].includes(l.status),
        ).length
        const closedCount = wonLeads.length

        const funnel = [
            {
                label: 'Total Inbound Leads',
                count: totalLeads,
                rate: 100,
                dropOff: totalLeads - contactedCount,
                color: 'bg-blue-600',
            },
            {
                label: 'Contacted',
                count: contactedCount,
                rate: totalLeads
                    ? Math.round((contactedCount / totalLeads) * 100)
                    : 0,
                dropOff: contactedCount - qualifiedCount,
                color: 'bg-indigo-600',
            },
            {
                label: 'Qualified',
                count: qualifiedCount,
                rate: totalLeads
                    ? Math.round((qualifiedCount / totalLeads) * 100)
                    : 0,
                dropOff: qualifiedCount - demoCount,
                color: 'bg-purple-600',
            },
            {
                label: 'Demos Arranged',
                count: demoCount,
                rate: totalLeads
                    ? Math.round((demoCount / totalLeads) * 100)
                    : 0,
                dropOff: demoCount - closedCount,
                color: 'bg-amber-500',
            },
            {
                label: 'Closed Won',
                count: closedCount,
                rate: totalLeads
                    ? Math.round((closedCount / totalLeads) * 100)
                    : 0,
                dropOff: 0,
                color: 'bg-emerald-600',
            },
        ]

        const sourceMap = {}
        filtered.forEach((l) => {
            const src = l.source || 'UNKNOWN'
            if (!sourceMap[src])
                sourceMap[src] = { count: 0, wonCount: 0, revenue: 0 }
            sourceMap[src].count++
            if (l.status === 'ENROLLED') {
                sourceMap[src].wonCount++
                sourceMap[src].revenue += l.estimatedValue || 0
            }
        })

        const sources = Object.keys(sourceMap)
            .map((key) => ({
                name: key.replace('_', ' '),
                totalLeads: sourceMap[key].count,
                percentage:
                    Math.round((sourceMap[key].count / totalLeads) * 100) || 0,
                revenue: sourceMap[key].revenue,
                conversionRate:
                    Math.round(
                        (sourceMap[key].wonCount / sourceMap[key].count) * 100,
                    ) || 0,
            }))
            .sort((a, b) => b.totalLeads - a.totalLeads)

        const teamMap = {}
        filtered.forEach((l) => {
            const name = l.assignedTo
                ? `${l.assignedTo.firstName || ''} ${l.assignedTo.lastName || ''}`.trim() ||
                  l.assignedTo.email
                : 'Unassigned'
            const id = l.assignedTo ? l.assignedTo._id : 'unassigned'

            if (!teamMap[id])
                teamMap[id] = {
                    id,
                    name,
                    role: l.assignedTo ? l.assignedTo.role : 'N/A',
                    assigned: 0,
                    closed: 0,
                    revenue: 0,
                }
            teamMap[id].assigned++
            if (l.status === 'ENROLLED') {
                teamMap[id].closed++
                teamMap[id].revenue += l.estimatedValue || 0
            }
            teamMap[id].winRate = teamMap[id].assigned
                ? ((teamMap[id].closed / teamMap[id].assigned) * 100).toFixed(1)
                : 0
        })

        const team = Object.values(teamMap).sort(
            (a, b) => b.revenue - a.revenue,
        )

        return {
            filteredLeads: filtered,
            salesReportData: {
                metrics: {
                    wonRevenue: `₹${wonRevenue.toLocaleString('en-IN')}`,
                    winRate: `${winRate}%`,
                    avgDealSize: `₹${Math.round(avgDealSize).toLocaleString('en-IN')}`,
                    avgCycleDays: avgCycleDays,
                },
                funnel,
                sources,
                team,
            },
        }
    }, [allLeads, timeRange])

    // 4. Process Finance Data
    const { filteredPayments, financeReportData } = useMemo(() => {
        const now = new Date()
        const filtered = allPayments.filter((payment) => {
            if (timeRange === 'all') return true
            const daysDiff =
                (now - new Date(payment.paymentDate)) / (1000 * 60 * 60 * 24)
            if (timeRange === '30d') return daysDiff <= 30
            if (timeRange === '90d') return daysDiff <= 90
            if (timeRange === '180d') return daysDiff <= 180
            if (timeRange === '1y') return daysDiff <= 365
            return true
        })

        const totalRevenue = filtered.reduce((sum, p) => sum + p.amount, 0)
        const avgPayment = filtered.length ? totalRevenue / filtered.length : 0

        return {
            filteredPayments: filtered,
            financeReportData: {
                totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
                transactionCount: filtered.length,
                avgPayment: `₹${Math.round(avgPayment).toLocaleString('en-IN')}`,
            },
        }
    }, [allPayments, timeRange])

    // 5. Process Course Enrollment Data
    const { filteredStudents, courseReportData } = useMemo(() => {
        if (!isAdmin)
            return {
                filteredStudents: [],
                courseReportData: { totalEnrollments: 0, courses: [] },
            }

        const now = new Date()
        const filtered = allStudents.filter((student) => {
            if (timeRange === 'all') return true
            const daysDiff =
                (now - new Date(student.createdAt)) / (1000 * 60 * 60 * 24)
            if (timeRange === '30d') return daysDiff <= 30
            if (timeRange === '90d') return daysDiff <= 90
            if (timeRange === '180d') return daysDiff <= 180
            if (timeRange === '1y') return daysDiff <= 365
            return true
        })

        const courseMap = {}
        let totalEnrollments = 0

        filtered.forEach((s) => {
            ;(s.enrolledCourses || []).forEach((c) => {
                const cTitle = c.courseTitle || 'Unknown Course'
                if (!courseMap[cTitle]) {
                    courseMap[cTitle] = { title: cTitle, count: 0, revenue: 0 }
                }
                courseMap[cTitle].count += 1
                courseMap[cTitle].revenue += c.fee || 0
                totalEnrollments += 1
            })
        })

        const courses = Object.values(courseMap).sort(
            (a, b) => b.count - a.count,
        )

        return {
            filteredStudents: filtered,
            courseReportData: { totalEnrollments, courses },
        }
    }, [allStudents, timeRange, isAdmin])

    // 6. CSV Export Logics
    const handleExportSalesCSV = () => {
        if (!filteredLeads.length) return alert('No data to export.')
        const headers = [
            'Full Name',
            'Email',
            'Phone',
            'Source',
            'Status',
            'Estimated Value',
            'Created At',
        ]
        const csvRows = filteredLeads.map((lead) =>
            [
                lead.fullName || '',
                lead.email || '',
                lead.phone || '',
                lead.source || '',
                lead.status || '',
                lead.estimatedValue || 0,
                new Date(lead.createdAt).toLocaleDateString('en-IN'),
            ]
                .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                .join(','),
        )
        triggerDownload(headers, csvRows, 'sales_pipeline')
    }

    const handleExportFinanceCSV = () => {
        if (!filteredPayments.length) return alert('No data to export.')
        const headers = [
            'Transaction ID',
            'Student',
            'Amount',
            'Payment Mode',
            'Date',
        ]
        const csvRows = filteredPayments.map((p) =>
            [
                p.transactionId || '',
                p.student?.fullName || 'Unknown',
                p.amount || 0,
                p.paymentMode?.label || '',
                new Date(p.paymentDate).toLocaleDateString('en-IN'),
            ]
                .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                .join(','),
        )
        triggerDownload(headers, csvRows, 'financial_ledger')
    }

    const handleExportCoursesCSV = () => {
        if (!courseReportData.courses.length) return alert('No data to export.')
        const headers = [
            'Course Title',
            'Total Student Enrollments',
            'Expected Course Revenue',
        ]
        const csvRows = courseReportData.courses.map((c) =>
            [c.title, c.count, c.revenue]
                .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                .join(','),
        )
        triggerDownload(headers, csvRows, 'course_enrollments')
    }

    const triggerDownload = (headers, rows, filename) => {
        const csvContent = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `trainEdge_${filename}_${timeRange}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
            </div>
        )
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header & Controls */}
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Analytics & Reports
                        </h1>
                        <p className='text-sm text-gray-500 mt-1'>
                            Showing data for{' '}
                            <span className='font-semibold text-blue-600'>
                                {activeTab === 'sales' && filteredLeads.length}
                                {activeTab === 'finance' &&
                                    filteredPayments.length}
                                {activeTab === 'courses' &&
                                    courseReportData.totalEnrollments}
                            </span>{' '}
                            records.
                        </p>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className='border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-blue-500 bg-gray-50'
                        >
                            <option value='30d'>Last 30 Days</option>
                            <option value='90d'>Last 90 Days</option>
                            <option value='180d'>Last 6 Months</option>
                            <option value='1y'>Last Year</option>
                            <option value='all'>All Time</option>
                        </select>
                        <button
                            onClick={() => {
                                if (activeTab === 'sales')
                                    handleExportSalesCSV()
                                else if (activeTab === 'finance')
                                    handleExportFinanceCSV()
                                else if (activeTab === 'courses')
                                    handleExportCoursesCSV()
                            }}
                            className='flex items-center justify-center py-2 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors'
                        >
                            <FiDownload className='mr-2' /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Admin Tab Navigation */}
                {isAdmin && (
                    <div className='flex gap-4 mb-6 overflow-x-auto pb-2'>
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`px-4 py-2 text-sm whitespace-nowrap font-medium rounded-lg transition-colors ${activeTab === 'finance' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            Financial Reporting
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`px-4 py-2 text-sm whitespace-nowrap font-medium rounded-lg transition-colors ${activeTab === 'sales' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            Sales Pipeline Reporting
                        </button>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`px-4 py-2 text-sm whitespace-nowrap font-medium rounded-lg transition-colors ${activeTab === 'courses' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            Course Enrollment Reporting
                        </button>
                    </div>
                )}

                {/* ========================================== */}
                {/* FINANCIAL REPORTS VIEW (Admin / Accounts)  */}
                {/* ========================================== */}
                {activeTab === 'finance' && (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                        <StatCard
                            title='Revenue Collected'
                            value={financeReportData.totalRevenue}
                            icon={FiDollarSign}
                            colorClass='bg-green-50 text-green-600'
                        />
                        <StatCard
                            title='Transactions'
                            value={financeReportData.transactionCount}
                            icon={FiCreditCard}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Average Payment Size'
                            value={financeReportData.avgPayment}
                            icon={FiAward}
                            colorClass='bg-purple-50 text-purple-600'
                        />
                    </div>
                )}

                {/* ========================================== */}
                {/* SALES REPORTS VIEW (Admin / Sales)         */}
                {/* ========================================== */}
                {activeTab === 'sales' && (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                            <StatCard
                                title='Total Closed Won'
                                value={salesReportData.metrics.wonRevenue}
                                icon={FiDollarSign}
                                colorClass='bg-green-50 text-green-600'
                            />
                            <StatCard
                                title='Opportunity Win Rate'
                                value={salesReportData.metrics.winRate}
                                icon={FiTarget}
                                colorClass='bg-blue-50 text-blue-600'
                            />
                            <StatCard
                                title='Average Deal Size'
                                value={salesReportData.metrics.avgDealSize}
                                icon={FiAward}
                                colorClass='bg-purple-50 text-purple-600'
                            />
                            <StatCard
                                title='Sales Cycle (Days)'
                                value={salesReportData.metrics.avgCycleDays}
                                icon={FiTrendingUp}
                                colorClass='bg-orange-50 text-orange-600'
                            />
                        </div>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                            <ConversionFunnel
                                funnelData={salesReportData.funnel}
                            />
                            <SourceBreakdown
                                sources={salesReportData.sources}
                            />
                        </div>
                        <RepPerformanceTable teamData={salesReportData.team} />
                    </>
                )}

                {/* ========================================== */}
                {/* COURSES REPORTS VIEW (Admin Only)          */}
                {/* ========================================== */}
                {activeTab === 'courses' && isAdmin && (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center'>
                            <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                                <FiBook className='text-blue-600' /> Course-wise
                                Enrollment Breakdown
                            </h3>
                            <span className='bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full'>
                                {courseReportData.totalEnrollments} Total
                                Subject Enrollments
                            </span>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left'>
                                <thead>
                                    <tr className='text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100'>
                                        <th className='px-6 py-4 font-medium'>
                                            Course Title
                                        </th>
                                        <th className='px-6 py-4 font-medium text-right'>
                                            Students Enrolled
                                        </th>
                                        <th className='px-6 py-4 font-medium text-right'>
                                            Expected Course Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {courseReportData.courses.map((c, i) => (
                                        <tr
                                            key={i}
                                            className='hover:bg-gray-50 transition-colors'
                                        >
                                            <td className='px-6 py-4 font-semibold text-gray-900'>
                                                {c.title}
                                            </td>
                                            <td className='px-6 py-4 text-right text-gray-700'>
                                                {c.count}
                                            </td>
                                            <td className='px-6 py-4 text-right font-medium text-green-600'>
                                                ₹
                                                {c.revenue.toLocaleString(
                                                    'en-IN',
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!courseReportData.courses.length && (
                                <div className='p-8 text-center text-gray-500'>
                                    No student course enrollments found for this
                                    period.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Reports
