// src/pages/Reports.jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import api from '../api/axios'
import RecordPaymentModal from '../components/admin/RecordPaymentModal'
import ReportToolbar from '../components/reports/ReportToolbar'
import FinanceReportView from '../components/reports/views/FinanceReportView'
import SalesReportView from '../components/reports/views/SalesReportView'
import CoursesReportView from '../components/reports/views/CoursesReportView'
import AcademicReportView from '../components/reports/views/AcademicReportView'

const Reports = () => {
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
    const [allStudents, setAllStudents] = useState([])
    const [allBatches, setAllBatches] = useState([])

    // Academic Report State
    const [selectedBatchId, setSelectedBatchId] = useState('')
    const [academicReportData, setAcademicReportData] = useState(null)
    const [isAcademicLoading, setIsAcademicLoading] = useState(false)

    // A/R Ledger State
    const [arSearchQuery, setArSearchQuery] = useState('')
    const [arStatusFilter, setArStatusFilter] = useState('DUE')
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedStudentForPayment, setSelectedStudentForPayment] =
        useState(null)

    const [isLoading, setIsLoading] = useState(true)

    const fetchAllData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [leadsRes, paymentsRes, studentsRes, batchesRes] =
                await Promise.allSettled([
                    isAdmin || isSales
                        ? api.get('/leads?limit=5000')
                        : Promise.resolve({ data: { data: [] } }),
                    isAdmin || isAccounts
                        ? api.get('/payments')
                        : Promise.resolve({ data: { data: [] } }),
                    isAdmin || isAccounts
                        ? api.get('/students?limit=5000')
                        : Promise.resolve({ data: { data: [] } }),
                    isAdmin || isAccounts
                        ? api.get('/batches')
                        : Promise.resolve({ data: { data: [] } }),
                ])

            if (isAdmin || isSales)
                setAllLeads(leadsRes.value?.data?.data || [])
            if (isAdmin || isAccounts) {
                setAllPayments(paymentsRes.value?.data?.data || [])
                setAllStudents(studentsRes.value?.data?.data || [])
            }
            if (isAdmin || isAccounts) {
                const batchesList = batchesRes.value?.data?.data || []
                setAllBatches(batchesList)
                if (batchesList.length > 0 && !selectedBatchId) {
                    setSelectedBatchId(batchesList[0]._id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch reporting data:', error)
        } finally {
            setIsLoading(false)
        }
    }, [isAdmin, isSales, isAccounts, selectedBatchId])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    useEffect(() => {
        if (activeTab === 'academic' && selectedBatchId) {
            const fetchAcademicReport = async () => {
                setIsAcademicLoading(true)
                try {
                    const { data } = await api.get(
                        `/evaluations/report/${selectedBatchId}`,
                    )
                    setAcademicReportData(data)
                } catch (err) {
                    console.error('Failed to fetch academic report', err)
                } finally {
                    setIsAcademicLoading(false)
                }
            }
            fetchAcademicReport()
        }
    }, [activeTab, selectedBatchId])

    // Compute Sales Data
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

    // Compute Finance Data
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

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const todayCollected = allPayments
            .filter((p) => new Date(p.paymentDate) >= startOfDay)
            .reduce((sum, p) => sum + p.amount, 0)

        let expectedRevenue = 0
        let totalOutstanding = 0
        allStudents.forEach((s) => {
            if (s.status !== 'PENDING_ASSIGNMENT') {
                expectedRevenue += s.totalFee || 0
                const due = (s.totalFee || 0) - (s.paidAmount || 0)
                if (due > 0) totalOutstanding += due
            }
        })

        return {
            filteredPayments: filtered,
            financeReportData: {
                totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
                todayCollected: `₹${todayCollected.toLocaleString('en-IN')}`,
                totalOutstanding: `₹${totalOutstanding.toLocaleString('en-IN')}`,
                expectedRevenue: `₹${expectedRevenue.toLocaleString('en-IN')}`,
                transactionCount: filtered.length,
            },
        }
    }, [allPayments, allStudents, timeRange])

    // Compute Course Data
    const { courseReportData } = useMemo(() => {
        if (!isAdmin)
            return { courseReportData: { totalEnrollments: 0, courses: [] } }
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
                if (!courseMap[cTitle])
                    courseMap[cTitle] = { title: cTitle, count: 0, revenue: 0 }
                courseMap[cTitle].count += 1
                courseMap[cTitle].revenue += c.fee || 0
                totalEnrollments += 1
            })
        })

        const courses = Object.values(courseMap).sort(
            (a, b) => b.count - a.count,
        )
        return { courseReportData: { totalEnrollments, courses } }
    }, [allStudents, timeRange, isAdmin])

    // Process A/R Ledger Data
    const filteredARStudents = useMemo(() => {
        return allStudents
            .filter((student) => {
                if (student.status === 'PENDING_ASSIGNMENT') return false

                const searchString = arSearchQuery.toLowerCase()
                const matchesSearch =
                    student.fullName?.toLowerCase().includes(searchString) ||
                    student.email?.toLowerCase().includes(searchString) ||
                    student.phone?.includes(searchString)

                const amountDue =
                    (student.totalFee || 0) - (student.paidAmount || 0)

                let matchesStatus = true
                if (arStatusFilter === 'DUE') matchesStatus = amountDue > 0
                if (arStatusFilter === 'PAID')
                    matchesStatus = amountDue <= 0 && student.totalFee > 0

                return matchesSearch && matchesStatus
            })
            .sort((a, b) => {
                const dueA = (a.totalFee || 0) - (a.paidAmount || 0)
                const dueB = (b.totalFee || 0) - (b.paidAmount || 0)
                return dueB - dueA
            })
    }, [allStudents, arSearchQuery, arStatusFilter])

    // CSV Trigger Utilities
    const triggerDownload = (headers, rows, filename) => {
        const csvContent = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `trainEdge_${filename}_${timeRange}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    const handleExportSalesCSV = () => {
        if (!filteredLeads.length) return alert('No data to export.')
        const headers = [
            'Full Name',
            'Email',
            'Phone',
            'Source',
            'Status',
            'Lead Owner',
            'Estimated Value',
            'Created At',
            'Last Interaction Date',
            'Next Follow-Up Date',
        ]
        const csvRows = filteredLeads.map((lead) => {
            const ownerName = lead.assignedTo
                ? `${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`.trim() ||
                  lead.assignedTo.email
                : 'Unassigned'
            return [
                lead.fullName || '',
                lead.email || '',
                lead.phone || '',
                lead.source || '',
                lead.status || '',
                ownerName,
                lead.estimatedValue || 0,
                lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString('en-IN')
                    : '',
                lead.updatedAt
                    ? new Date(lead.updatedAt).toLocaleDateString('en-IN')
                    : '-',
                lead.nextFollowUpDate
                    ? new Date(lead.nextFollowUpDate).toLocaleDateString(
                          'en-IN',
                      )
                    : 'Not scheduled',
            ]
                .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                .join(',')
        })
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

    const handleExportAcademicCSV = () => {
        if (!academicReportData || !academicReportData.data.length)
            return alert('No academic data to export.')
        const headers = [
            'Exam Title',
            'Exam Date',
            'Student Name',
            'Marks Obtained',
            'Total Marks',
            'Grade',
            'Remarks',
        ]
        let rows = []
        academicReportData.data.forEach((exam) => {
            exam.records.forEach((rec) => {
                rows.push(
                    [
                        exam.examTitle,
                        new Date(exam.examDate).toLocaleDateString('en-IN'),
                        rec.student?.fullName || 'Unknown',
                        rec.obtainedMarks,
                        exam.totalMarks,
                        rec.grade || '-',
                        rec.facultyRemarks || '-',
                    ]
                        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                        .join(','),
                )
            })
        })
        triggerDownload(headers, rows, 'academic_cohort_report')
    }

    const handleExportCurrentTab = () => {
        if (activeTab === 'sales') handleExportSalesCSV()
        else if (activeTab === 'finance') handleExportFinanceCSV()
        else if (activeTab === 'courses') handleExportCoursesCSV()
        else if (activeTab === 'academic') handleExportAcademicCSV()
    }

    const getRecordCount = () => {
        if (activeTab === 'sales') return filteredLeads.length
        if (activeTab === 'finance') return filteredPayments.length
        if (activeTab === 'courses') return courseReportData.totalEnrollments
        if (activeTab === 'academic')
            return academicReportData?.data?.length || 0
        return 0
    }

    if (isLoading && allStudents.length === 0) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
            </div>
        )
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header Toolbar */}
                <ReportToolbar
                    activeTab={activeTab}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    recordCount={getRecordCount()}
                    onExport={handleExportCurrentTab}
                />

                {/* Role-Based Tab Navigation */}
                {(isAdmin || isAccounts) && (
                    <div className='flex gap-4 mb-6 overflow-x-auto pb-2'>
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`px-4 py-2 text-sm whitespace-nowrap font-medium rounded-lg transition-colors ${activeTab === 'finance' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            Financial Reporting & Collections
                        </button>
                        {isAdmin && (
                            <>
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
                                <button
                                    onClick={() => setActiveTab('academic')}
                                    className={`px-4 py-2 text-sm whitespace-nowrap font-medium rounded-lg transition-colors ${activeTab === 'academic' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Academic Cohort Reporting
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Domain View Routing */}
                {activeTab === 'finance' && (
                    <FinanceReportView
                        financeReportData={financeReportData}
                        timeRange={timeRange}
                        filteredARStudents={filteredARStudents}
                        arSearchQuery={arSearchQuery}
                        setArSearchQuery={setArSearchQuery}
                        arStatusFilter={arStatusFilter}
                        setArStatusFilter={setArStatusFilter}
                        onCollectFeeClick={(studentId) => {
                            setSelectedStudentForPayment(studentId)
                            setIsPaymentModalOpen(true)
                        }}
                    />
                )}

                {activeTab === 'sales' && (
                    <SalesReportView salesReportData={salesReportData} />
                )}

                {activeTab === 'courses' && isAdmin && (
                    <CoursesReportView courseReportData={courseReportData} />
                )}

                {activeTab === 'academic' && isAdmin && (
                    <AcademicReportView
                        batches={allBatches}
                        selectedBatchId={selectedBatchId}
                        onSelectBatchId={setSelectedBatchId}
                        academicReportData={academicReportData}
                        isLoading={isAcademicLoading}
                    />
                )}
            </div>

            {/* Payment Modal */}
            <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false)
                    setSelectedStudentForPayment(null)
                }}
                onPaymentSuccess={() => {
                    setIsPaymentModalOpen(false)
                    setSelectedStudentForPayment(null)
                    fetchAllData()
                }}
                prefillStudentId={selectedStudentForPayment}
            />
        </div>
    )
}

export default Reports
