// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react'
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
} from 'react-icons/fi'
import api from '../api/axios'
import StatCard from '../components/common/StatCard'
import RecentLeadsTable from '../components/dashboard/RecentLeadsTable'
import FollowUpList from '../components/dashboard/FollowUpList'
import ConversionFunnel from '../components/dashboard/ConversionFunnel'
import SourceBreakdown from '../components/reports/SourceBreakdown'
import RepPerformanceTable from '../components/reports/RepPerformanceTable'
import RecordPaymentModal from '../components/admin/RecordPaymentModal'

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null)
    const [userRole, setUserRole] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // Revenue Collection States
    const [students, setStudents] = useState([])
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedStudentForPayment, setSelectedStudentForPayment] =
        useState(null)

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await api.get('/analytics')
            const role = (res.data.role || '').toLowerCase()
            setDashboardData(res.data.data)
            setUserRole(role)

            // Fetch students globally if role requires the outstanding dues table
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

        // NEW: Calculate the Total Booked Revenue Pipeline
        const totalRevenuePipeline = totalCollected + totalOutstanding

        return (
            <div className='bg-gray-50 min-h-screen py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='mb-8'>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Financial & Collections Dashboard
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Manage fee receipts, transaction history, and
                            revenue collection ledger.
                        </p>
                    </div>

                    {/* UPDATED: 5-column grid on extra-large screens */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8'>
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

                    {/* Outstanding Dues Action Table */}
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8'>
                        <div className='px-6 py-4 border-b border-gray-100 bg-red-50/30 flex justify-between items-center'>
                            <div>
                                <h3 className='text-lg font-bold text-gray-900'>
                                    Action Required: Outstanding Dues
                                </h3>
                                <p className='text-xs text-gray-500'>
                                    Students with pending fee balances requiring
                                    collection.
                                </p>
                            </div>
                            <a
                                href='/admin/payments'
                                className='text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors'
                            >
                                View Full Ledger &rarr;
                            </a>
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm text-left text-gray-600'>
                                <thead className='text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100'>
                                    <tr>
                                        <th className='px-6 py-3 font-semibold'>
                                            Student Name
                                        </th>
                                        <th className='px-6 py-3 font-semibold'>
                                            Contact
                                        </th>
                                        <th className='px-6 py-3 font-semibold text-right'>
                                            Total Fee
                                        </th>
                                        <th className='px-6 py-3 font-semibold text-right'>
                                            Paid
                                        </th>
                                        <th className='px-6 py-3 font-bold text-red-600 text-right'>
                                            Amount Due
                                        </th>
                                        <th className='px-6 py-3 font-semibold text-center'>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {students
                                        .filter(
                                            (s) =>
                                                s.status !==
                                                    'PENDING_ASSIGNMENT' &&
                                                (s.totalFee || 0) -
                                                    (s.paidAmount || 0) >
                                                    0,
                                        )
                                        .sort(
                                            (a, b) =>
                                                (b.totalFee || 0) -
                                                (b.paidAmount || 0) -
                                                ((a.totalFee || 0) -
                                                    (a.paidAmount || 0)),
                                        )
                                        .map((student) => {
                                            const dueAmount =
                                                (student.totalFee || 0) -
                                                (student.paidAmount || 0)

                                            return (
                                                <tr
                                                    key={student._id}
                                                    className='hover:bg-gray-50 transition-colors'
                                                >
                                                    <td className='px-6 py-4 font-medium text-gray-900'>
                                                        {student.fullName}
                                                    </td>
                                                    <td className='px-6 py-4 text-xs'>
                                                        {student.phone}
                                                        <br />
                                                        <span className='text-gray-400'>
                                                            {student.email}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-right'>
                                                        ₹
                                                        {(
                                                            student.totalFee ||
                                                            0
                                                        ).toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 text-right text-green-600'>
                                                        ₹
                                                        {(
                                                            student.paidAmount ||
                                                            0
                                                        ).toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4 text-right font-bold text-red-600 bg-red-50/30'>
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
                                        })}
                                    {students.filter(
                                        (s) =>
                                            s.status !== 'PENDING_ASSIGNMENT' &&
                                            (s.totalFee || 0) -
                                                (s.paidAmount || 0) >
                                                0,
                                    ).length === 0 && (
                                        <tr>
                                            <td
                                                colSpan='6'
                                                className='px-6 py-8 text-center text-gray-500 italic'
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
                </div>

                {/* Shared Payment Modal Component */}
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
        )
    }

    // ==========================================
    // 1. FACULTY DASHBOARD VIEW
    // ==========================================
    if (userRole === 'faculty') {
        const { totalStudents, activeStudents, studentsList } =
            dashboardData || {}
        return (
            <div className='bg-gray-50 min-h-screen py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='mb-8'>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Faculty Academic Dashboard
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Monitor your active student roster and academic
                            progression.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8'>
                        <StatCard
                            title='Total Students'
                            value={totalStudents || 0}
                            icon={FiUsers}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Active Roster'
                            value={activeStudents || 0}
                            icon={FiCheckCircle}
                            colorClass='bg-green-50 text-green-600'
                        />
                    </div>

                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6'>
                        <h3 className='font-bold text-gray-900 mb-4'>
                            Assigned Student Delivery Roster
                        </h3>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b'>
                                        <th className='px-6 py-3 font-medium'>
                                            Student Name
                                        </th>
                                        <th className='px-6 py-3 font-medium'>
                                            Email / Phone
                                        </th>
                                        <th className='px-6 py-3 font-medium'>
                                            Courses
                                        </th>
                                        <th className='px-6 py-3 font-medium'>
                                            Cohort / Batch
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {(studentsList || []).map((s) => (
                                        <tr
                                            key={s._id}
                                            className='hover:bg-gray-50'
                                        >
                                            <td className='px-6 py-4 font-medium text-gray-900'>
                                                {s.fullName}
                                            </td>
                                            <td className='px-6 py-4 text-gray-500'>
                                                <div>{s.email}</div>
                                                <div>{s.phone}</div>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='flex flex-col gap-1'>
                                                    {(
                                                        s.enrolledCourses || []
                                                    ).map((c) => (
                                                        <span
                                                            key={c._id}
                                                            className='bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs inline-block w-fit'
                                                        >
                                                            {c.courseTitle}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='flex flex-col gap-1'>
                                                    {s.batches &&
                                                    s.batches.length > 0 ? (
                                                        s.batches.map((b) => (
                                                            <span
                                                                key={b._id}
                                                                className='inline-flex items-center bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium w-fit'
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
                                            </td>
                                        </tr>
                                    ))}
                                    {(!studentsList ||
                                        studentsList.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan='4'
                                                className='text-center py-8 text-gray-500'
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
            totalLeads,
            activePipeline,
            conversionRate,
            newThisWeek,
            recentLeads,
            pendingFollowUps,
        } = dashboardData || {}

        return (
            <div className='bg-gray-50 min-h-screen py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='mb-8'>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Sales Performance Dashboard
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Track your active pipeline velocity and daily tasks.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                        <StatCard
                            title='My Assigned Leads'
                            value={totalLeads || 0}
                            icon={FiUsers}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Active Pipeline'
                            value={activePipeline || 0}
                            icon={FiDollarSign}
                            colorClass='bg-green-50 text-green-600'
                        />
                        <StatCard
                            title='Conversion Rate'
                            value={conversionRate || '0%'}
                            icon={FiTrendingUp}
                            colorClass='bg-purple-50 text-purple-600'
                        />
                        <StatCard
                            title='New This Week'
                            value={newThisWeek || 0}
                            icon={FiActivity}
                            colorClass='bg-orange-50 text-orange-600'
                        />
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        <div className='lg:col-span-2 space-y-8'>
                            <RecentLeadsTable leads={recentLeads || []} />
                        </div>
                        <div className='space-y-8'>
                            <FollowUpList tasks={pendingFollowUps || []} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================
    // 3. ADMIN GLOBAL OVERSIGHT DASHBOARD VIEW
    // ==========================================
    const {
        totalLeads,
        activePipeline,
        conversionRate,
        newThisWeek,
        recentLeads,
        funnelData,
        sources,
        teamData,
        financeStats,
        academicStats,
        systemStats,
    } = dashboardData || {}

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='mb-8'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Admin Executive Overview
                    </h1>
                    <p className='text-gray-500 text-sm mt-1'>
                        Enterprise-wide visibility into acquisition velocity,
                        revenue, and system health.
                    </p>
                </div>

                {/* Section 1: Sales & Pipeline */}
                <h2 className='text-lg font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200'>
                    Sales & Acquisition Funnel
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <StatCard
                        title='Total Institute Leads'
                        value={totalLeads || 0}
                        icon={FiUsers}
                        colorClass='bg-blue-50 text-blue-600'
                    />
                    <StatCard
                        title='Global Active Pipeline'
                        value={`₹${(activePipeline || 0).toLocaleString('en-IN')}`}
                        icon={FiTarget}
                        colorClass='bg-emerald-50 text-emerald-600'
                    />
                    <StatCard
                        title='Overall Conversion'
                        value={`${conversionRate || 0}%`}
                        icon={FiTrendingUp}
                        colorClass='bg-purple-50 text-purple-600'
                    />
                    <StatCard
                        title='New Leads This Week'
                        value={newThisWeek || 0}
                        icon={FiActivity}
                        colorClass='bg-orange-50 text-orange-600'
                    />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    <ConversionFunnel funnelData={funnelData || {}} />
                    <SourceBreakdown sources={sources || []} />
                </div>

                {/* Section 2: Revenue & Academic Delivery */}
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8'>
                    <div>
                        <h2 className='text-lg font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200'>
                            Revenue & Collections
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                            <StatCard
                                title='Ledger Transactions'
                                value={financeStats?.transactionCount || 0}
                                icon={FiCreditCard}
                                colorClass='bg-indigo-50 text-indigo-600'
                            />
                        </div>
                    </div>
                    <div>
                        <h2 className='text-lg font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200'>
                            Academic & System Roster
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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

                <div className='space-y-8'>
                    <RepPerformanceTable teamData={teamData || []} />
                    <RecentLeadsTable leads={recentLeads || []} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
