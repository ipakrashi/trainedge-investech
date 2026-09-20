// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    FiUsers,
    FiTrendingUp,
    FiDollarSign,
    FiActivity,
    FiCheckCircle,
    FiCreditCard,
    FiTarget,
    FiLayers,
    FiAlertCircle,
    FiPlus,
    FiMail,
    FiPhone,
    FiBookOpen,
} from 'react-icons/fi'
import api from '../api/axios'
import StatCard from '../components/common/StatCard'
import RecentLeadsTable from '../components/dashboard/RecentLeadsTable'
import FollowUpList from '../components/dashboard/FollowUpList'
import ConversionFunnel from '../components/dashboard/ConversionFunnel'
import SourceBreakdown from '../components/reports/SourceBreakdown'
import RepPerformanceTable from '../components/reports/RepPerformanceTable'
import RecordPaymentModal from '../components/admin/RecordPaymentModal'
import LeadActivityPanel from '../components/leads/LeadActivityPanel'

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null)
    const [userRole, setUserRole] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // Finance/Accounts States
    const [students, setStudents] = useState([])
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedStudentForPayment, setSelectedStudentForPayment] =
        useState(null)

    // Sales Lead Activity States
    const [selectedLeadForActivity, setSelectedLeadForActivity] = useState(null)
    const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false)

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await api.get('/analytics')
            const role = (res.data.role || '').toLowerCase()
            setDashboardData(res.data.data)
            setUserRole(role)

            if (role === 'accounts' || role === 'admin') {
                const stdRes = await api.get('/students?limit=5000')
                setStudents(stdRes.data?.data || [])
            }
        } catch (error) {
            console.error('Failed to load dashboard metrics:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    // Memoize students with dues for accounts/admin view
    const outstandingStudents = useMemo(() => {
        return students
            .filter(
                (s) =>
                    s.status !== 'PENDING_ASSIGNMENT' &&
                    (s.totalFee || 0) - (s.paidAmount || 0) > 0,
            )
            .sort(
                (a, b) =>
                    (b.totalFee || 0) -
                    (b.paidAmount || 0) -
                    ((a.totalFee || 0) - (a.paidAmount || 0)),
            )
    }, [students])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        )
    }

    // ==========================================
    // 0. ACCOUNTS / FINANCE DASHBOARD VIEW
    // ==========================================
    if (userRole === 'accounts') {
        const {
            totalCollected = 0,
            todayCollected = 0,
            totalOutstanding = 0,
            transactionCount = 0,
        } = dashboardData || {}

        const totalRevenuePipeline = totalCollected + totalOutstanding

        return (
            <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='mb-6 sm:mb-8'>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                            Financial & Collections Dashboard
                        </h1>
                        <p className='text-gray-500 text-xs sm:text-sm mt-1'>
                            Manage fee receipts, transaction history, and
                            revenue collection ledger.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8'>
                        <StatCard
                            title='Total Revenue Pipeline'
                            value={`₹${totalRevenuePipeline.toLocaleString('en-IN')}`}
                            icon={FiTarget}
                            colorClass='bg-indigo-50 text-indigo-600'
                        />
                        <StatCard
                            title='Total Lifetime Collections'
                            value={`₹${totalCollected.toLocaleString('en-IN')}`}
                            icon={FiDollarSign}
                            colorClass='bg-green-50 text-green-600'
                        />
                        <StatCard
                            title='Total Outstanding Dues'
                            value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
                            icon={FiAlertCircle}
                            colorClass='bg-red-50 text-red-600'
                        />
                        <StatCard
                            title="Today's Collections"
                            value={`₹${todayCollected.toLocaleString('en-IN')}`}
                            icon={FiTrendingUp}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Ledger Transactions'
                            value={transactionCount}
                            icon={FiCreditCard}
                            colorClass='bg-purple-50 text-purple-600'
                        />
                    </div>

                    {/* Action Required: Outstanding Dues Card */}
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8'>
                        <div className='p-4 sm:p-6 border-b border-gray-100 bg-red-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
                            <div>
                                <h3 className='text-base sm:text-lg font-bold text-gray-900'>
                                    Action Required: Outstanding Dues
                                </h3>
                                <p className='text-xs text-gray-500'>
                                    Students with pending fee balances requiring
                                    collection.
                                </p>
                            </div>
                            <a
                                href='/admin/payments'
                                className='text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors'
                            >
                                View Full Ledger &rarr;
                            </a>
                        </div>

                        {/* 1. Mobile Card View (< md) */}
                        <div className='block md:hidden divide-y divide-gray-100'>
                            {outstandingStudents.length > 0 ? (
                                outstandingStudents.map((student) => {
                                    const total = student.totalFee || 0
                                    const paid = student.paidAmount || 0
                                    const dueAmount = total - paid

                                    return (
                                        <div
                                            key={student._id}
                                            className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                                        >
                                            <div className='flex items-start justify-between gap-2'>
                                                <div>
                                                    <div className='font-bold text-gray-900 text-sm'>
                                                        {student.fullName}
                                                    </div>
                                                    <div className='text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate'>
                                                        <FiMail className='text-gray-400 flex-shrink-0' />
                                                        <span className='truncate'>
                                                            {student.email}
                                                        </span>
                                                    </div>
                                                    {student.phone && (
                                                        <div className='text-xs text-gray-400 flex items-center gap-1.5 mt-0.5'>
                                                            <FiPhone className='text-gray-400 flex-shrink-0' />
                                                            <span>
                                                                {student.phone}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedStudentForPayment(
                                                            student._id,
                                                        )
                                                        setIsPaymentModalOpen(
                                                            true,
                                                        )
                                                    }}
                                                    className='px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors inline-flex items-center gap-1 flex-shrink-0'
                                                >
                                                    <FiPlus /> Collect Fee
                                                </button>
                                            </div>

                                            <div className='grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-center text-xs'>
                                                <div>
                                                    <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                                        Total
                                                    </span>
                                                    <span className='font-semibold text-gray-800 text-xs mt-0.5 block'>
                                                        ₹
                                                        {total.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                                        Paid
                                                    </span>
                                                    <span className='font-semibold text-green-600 text-xs mt-0.5 block'>
                                                        ₹
                                                        {paid.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                                        Due
                                                    </span>
                                                    <span className='font-bold text-red-600 text-xs mt-0.5 block'>
                                                        ₹
                                                        {dueAmount.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className='p-8 text-center text-xs sm:text-sm text-gray-500 italic'>
                                    All student accounts are currently fully
                                    paid.
                                </div>
                            )}
                        </div>

                        {/* 2. Desktop Table View (>= md) */}
                        <div className='hidden md:block overflow-x-auto'>
                            <table className='w-full text-sm text-left text-gray-600 border-collapse'>
                                <thead className='text-xs text-gray-900 font-bold uppercase bg-gray-50/50 border-b border-gray-100'>
                                    <tr>
                                        <th className='px-6 py-4'>
                                            Student Name
                                        </th>
                                        <th className='px-6 py-4'>Contact</th>
                                        <th className='px-6 py-4 text-right'>
                                            Total Fee
                                        </th>
                                        <th className='px-6 py-4 text-right'>
                                            Paid
                                        </th>
                                        <th className='px-6 py-4 font-bold text-red-600 text-right'>
                                            Amount Due
                                        </th>
                                        <th className='px-6 py-4 text-center'>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {outstandingStudents.length > 0 ? (
                                        outstandingStudents.map((student) => {
                                            const total = student.totalFee || 0
                                            const paid = student.paidAmount || 0
                                            const dueAmount = total - paid

                                            return (
                                                <tr
                                                    key={student._id}
                                                    className='hover:bg-gray-50 transition-colors'
                                                >
                                                    <td className='px-6 py-4 font-semibold text-gray-900'>
                                                        {student.fullName}
                                                    </td>
                                                    <td className='px-6 py-4 text-xs'>
                                                        <div>
                                                            {student.phone}
                                                        </div>
                                                        <span className='text-gray-400'>
                                                            {student.email}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-right font-medium text-gray-800'>
                                                        ₹
                                                        {total.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 text-right font-medium text-green-600'>
                                                        ₹
                                                        {paid.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 text-right font-bold text-red-600 bg-red-50/20'>
                                                        ₹
                                                        {dueAmount.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 text-center'>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudentForPayment(
                                                                    student._id,
                                                                )
                                                                setIsPaymentModalOpen(
                                                                    true,
                                                                )
                                                            }}
                                                            className='px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors inline-flex items-center gap-1'
                                                        >
                                                            <FiPlus /> Collect
                                                            Fee
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan='6'
                                                className='px-6 py-8 text-center text-gray-400 text-xs sm:text-sm italic'
                                            >
                                                All student accounts are
                                                currently fully paid.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <RecordPaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => {
                            setIsPaymentModalOpen(false)
                            setSelectedStudentForPayment(null)
                        }}
                        onPaymentSuccess={() => {
                            setIsPaymentModalOpen(false)
                            setSelectedStudentForPayment(null)
                            fetchAnalytics()
                        }}
                        prefillStudentId={selectedStudentForPayment}
                    />
                </div>
            </div>
        )
    }

    // ==========================================
    // 1. FACULTY DASHBOARD VIEW
    // ==========================================
    if (userRole === 'faculty') {
        const {
            totalStudents = 0,
            activeStudents = 0,
            studentsList = [],
        } = dashboardData || {}

        return (
            <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='mb-6 sm:mb-8'>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                            Faculty Academic Dashboard
                        </h1>
                        <p className='text-gray-500 text-xs sm:text-sm mt-1'>
                            Monitor your active student roster and academic
                            progression.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8'>
                        <StatCard
                            title='Total Students'
                            value={totalStudents}
                            icon={FiUsers}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Active Roster'
                            value={activeStudents}
                            icon={FiCheckCircle}
                            colorClass='bg-green-50 text-green-600'
                        />
                    </div>

                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between'>
                            <h3 className='font-bold text-gray-900 text-base sm:text-lg'>
                                Assigned Student Delivery Roster
                            </h3>
                            <span className='text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full'>
                                {studentsList.length}{' '}
                                {studentsList.length === 1
                                    ? 'Student'
                                    : 'Students'}
                            </span>
                        </div>

                        {/* 1. Mobile Card View (< md) */}
                        <div className='block md:hidden divide-y divide-gray-100'>
                            {studentsList.length > 0 ? (
                                studentsList.map((s) => (
                                    <div
                                        key={s._id}
                                        className='p-4 space-y-2.5 hover:bg-gray-50 transition-colors'
                                    >
                                        <div className='font-bold text-gray-900 text-sm'>
                                            {s.fullName}
                                        </div>

                                        <div className='bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs space-y-1 text-gray-600'>
                                            <div className='flex items-center gap-1.5 truncate'>
                                                <FiMail className='text-gray-400 flex-shrink-0' />
                                                <span className='truncate'>
                                                    {s.email}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1.5'>
                                                <FiPhone className='text-gray-400 flex-shrink-0' />
                                                <span>{s.phone}</span>
                                            </div>
                                        </div>

                                        <div className='space-y-2 text-xs pt-1'>
                                            <div>
                                                <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1'>
                                                    Courses
                                                </span>
                                                <div className='flex flex-wrap gap-1'>
                                                    {(
                                                        s.enrolledCourses || []
                                                    ).map((c) => (
                                                        <span
                                                            key={c._id}
                                                            className='inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium'
                                                        >
                                                            <FiBookOpen className='mr-1' />{' '}
                                                            {c.courseTitle}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1'>
                                                    Cohort / Batch
                                                </span>
                                                <div className='flex flex-wrap gap-1'>
                                                    {s.batches &&
                                                    s.batches.length > 0 ? (
                                                        s.batches.map((b) => (
                                                            <span
                                                                key={b._id}
                                                                className='inline-flex items-center bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium'
                                                            >
                                                                <FiLayers className='mr-1' />{' '}
                                                                {b.batchName}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className='text-gray-400 text-xs italic'>
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='p-8 text-center text-xs sm:text-sm text-gray-400'>
                                    No active students assigned.
                                </div>
                            )}
                        </div>

                        {/* 2. Desktop Table View (>= md) */}
                        <div className='hidden md:block overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='bg-gray-50 text-gray-900 font-bold text-xs uppercase tracking-wider border-b border-gray-100'>
                                        <th className='px-6 py-4'>
                                            Student Name
                                        </th>
                                        <th className='px-6 py-4'>
                                            Email / Phone
                                        </th>
                                        <th className='px-6 py-4'>Courses</th>
                                        <th className='px-6 py-4'>
                                            Cohort / Batch
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {studentsList.length > 0 ? (
                                        studentsList.map((s) => (
                                            <tr
                                                key={s._id}
                                                className='hover:bg-gray-50 transition-colors'
                                            >
                                                <td className='px-6 py-4 font-semibold text-gray-900'>
                                                    {s.fullName}
                                                </td>
                                                <td className='px-6 py-4 text-gray-600 text-xs'>
                                                    <div>{s.email}</div>
                                                    <div className='text-gray-400 mt-0.5'>
                                                        {s.phone}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <div className='flex flex-wrap gap-1'>
                                                        {(
                                                            s.enrolledCourses ||
                                                            []
                                                        ).map((c) => (
                                                            <span
                                                                key={c._id}
                                                                className='bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1'
                                                            >
                                                                <FiBookOpen />{' '}
                                                                {c.courseTitle}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <div className='flex flex-wrap gap-1'>
                                                        {s.batches &&
                                                        s.batches.length > 0 ? (
                                                            s.batches.map(
                                                                (b) => (
                                                                    <span
                                                                        key={
                                                                            b._id
                                                                        }
                                                                        className='inline-flex items-center bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded text-xs font-medium'
                                                                    >
                                                                        <FiLayers className='mr-1' />{' '}
                                                                        {
                                                                            b.batchName
                                                                        }
                                                                    </span>
                                                                ),
                                                            )
                                                        ) : (
                                                            <span className='text-gray-400 text-xs italic'>
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan='4'
                                                className='px-6 py-12 text-center text-gray-400 text-sm'
                                            >
                                                No active students assigned.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================
    // 2. SALES / COUNSELOR DASHBOARD VIEW
    // ==========================================
    if (userRole === 'sales') {
        const {
            totalLeads = 0,
            activePipeline = 0,
            conversionRate = '0%',
            newThisWeek = 0,
            recentLeads = [],
            pendingFollowUps = [],
        } = dashboardData || {}

        return (
            <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='mb-6 sm:mb-8'>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                            Sales Performance Dashboard
                        </h1>
                        <p className='text-gray-500 text-xs sm:text-sm mt-1'>
                            Track your active pipeline velocity and daily
                            interaction tasks.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
                        <StatCard
                            title='My Assigned Leads'
                            value={totalLeads}
                            icon={FiUsers}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Active Pipeline'
                            value={activePipeline}
                            icon={FiDollarSign}
                            colorClass='bg-green-50 text-green-600'
                        />
                        <StatCard
                            title='Conversion Rate'
                            value={conversionRate}
                            icon={FiTrendingUp}
                            colorClass='bg-purple-50 text-purple-600'
                        />
                        <StatCard
                            title='New This Week'
                            value={newThisWeek}
                            icon={FiActivity}
                            colorClass='bg-orange-50 text-orange-600'
                        />
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8'>
                        <div className='lg:col-span-2 space-y-6 sm:space-y-8'>
                            <RecentLeadsTable
                                leads={recentLeads}
                                onSelectLead={(lead) => {
                                    setSelectedLeadForActivity(lead)
                                    setIsActivityPanelOpen(true)
                                }}
                            />
                        </div>
                        <div className='space-y-6 sm:space-y-8'>
                            <FollowUpList
                                tasks={pendingFollowUps}
                                onSelectLead={(lead) => {
                                    setSelectedLeadForActivity(lead)
                                    setIsActivityPanelOpen(true)
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Lead Activity Drawer */}
                <LeadActivityPanel
                    isOpen={isActivityPanelOpen}
                    lead={selectedLeadForActivity}
                    onClose={() => {
                        setIsActivityPanelOpen(false)
                        setSelectedLeadForActivity(null)
                    }}
                    onActivitySuccess={() => {
                        fetchAnalytics()
                    }}
                />
            </div>
        )
    }

    // ==========================================
    // 3. ADMIN GLOBAL OVERSIGHT DASHBOARD VIEW
    // ==========================================
    const {
        totalLeads = 0,
        activePipeline = 0,
        conversionRate = 0,
        newThisWeek = 0,
        recentLeads = [],
        funnelData = {},
        sources = [],
        teamData = [],
        financeStats = {},
        academicStats = {},
        systemStats = {},
    } = dashboardData || {}

    return (
        <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='mb-6 sm:mb-8'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                        Admin Executive Overview
                    </h1>
                    <p className='text-gray-500 text-xs sm:text-sm mt-1'>
                        Enterprise-wide visibility into acquisition velocity,
                        revenue, and system health.
                    </p>
                </div>

                {/* Sales Funnel Metrics */}
                <h2 className='text-base sm:text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200'>
                    Sales & Acquisition Funnel
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
                    <StatCard
                        title='Total Institute Leads'
                        value={totalLeads}
                        icon={FiUsers}
                        colorClass='bg-blue-50 text-blue-600'
                    />
                    <StatCard
                        title='Global Active Pipeline'
                        value={`₹${activePipeline.toLocaleString('en-IN')}`}
                        icon={FiTarget}
                        colorClass='bg-emerald-50 text-emerald-600'
                    />
                    <StatCard
                        title='Overall Conversion'
                        value={`${conversionRate}%`}
                        icon={FiTrendingUp}
                        colorClass='bg-purple-50 text-purple-600'
                    />
                    <StatCard
                        title='New Leads This Week'
                        value={newThisWeek}
                        icon={FiActivity}
                        colorClass='bg-orange-50 text-orange-600'
                    />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8'>
                    <ConversionFunnel funnelData={funnelData} />
                    <SourceBreakdown sources={sources} />
                </div>

                {/* Revenue & Academic Overview Grids */}
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8'>
                    {/* Finance Card */}
                    <div>
                        <h2 className='text-base sm:text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200'>
                            Revenue & Collections
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                            <StatCard
                                title='Total Lifetime Collections'
                                value={`₹${(financeStats?.totalCollected || 0).toLocaleString('en-IN')}`}
                                icon={FiDollarSign}
                                colorClass='bg-green-50 text-green-600'
                            />
                            <StatCard
                                title="Today's Collections"
                                value={`₹${(financeStats?.todayCollected || 0).toLocaleString('en-IN')}`}
                                icon={FiTrendingUp}
                                colorClass='bg-blue-50 text-blue-600'
                            />
                            <StatCard
                                title='Total Outstanding Dues'
                                value={`₹${(financeStats?.totalOutstanding || 0).toLocaleString('en-IN')}`}
                                icon={FiAlertCircle}
                                colorClass='bg-red-50 text-red-600'
                            />
                            <StatCard
                                title='Expected Pipeline Revenue'
                                value={`₹${(academicStats?.expectedRevenue || 0).toLocaleString('en-IN')}`}
                                icon={FiTarget}
                                colorClass='bg-purple-50 text-purple-600'
                            />
                            <div className='sm:col-span-2'>
                                <StatCard
                                    title='Ledger Transactions Logged'
                                    value={financeStats?.transactionCount || 0}
                                    icon={FiCreditCard}
                                    colorClass='bg-indigo-50 text-indigo-600'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic & Staff Roster */}
                    <div>
                        <h2 className='text-base sm:text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200'>
                            Academic & System Roster
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                            <StatCard
                                title='Total Registered Students'
                                value={academicStats?.totalStudents || 0}
                                icon={FiUsers}
                                colorClass='bg-teal-50 text-teal-600'
                            />
                            <StatCard
                                title='Active Students'
                                value={academicStats?.activeStudents || 0}
                                icon={FiCheckCircle}
                                colorClass='bg-green-50 text-green-600'
                            />
                            <StatCard
                                title='Total System Users'
                                value={systemStats?.totalUsers || 0}
                                icon={FiUsers}
                                colorClass='bg-gray-50 text-gray-600'
                            />
                            <StatCard
                                title='Active Staff Users'
                                value={systemStats?.activeUsers || 0}
                                icon={FiActivity}
                                colorClass='bg-amber-50 text-amber-600'
                            />
                        </div>
                    </div>
                </div>

                {/* Team & Lead Tables */}
                <div className='space-y-6 sm:space-y-8'>
                    <RepPerformanceTable teamData={teamData} />
                    <RecentLeadsTable leads={recentLeads} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
