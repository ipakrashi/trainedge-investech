// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import {
    FiUsers,
    FiTrendingUp,
    FiDollarSign,
    FiActivity,
    FiCheckCircle,
    FiCreditCard,
    FiTarget,
} from 'react-icons/fi'
import api from '../api/axios'
import StatCard from '../components/common/StatCard'
import RecentLeadsTable from '../components/dashboard/RecentLeadsTable'
import FollowUpList from '../components/dashboard/FollowUpList'
import ConversionFunnel from '../components/dashboard/ConversionFunnel'
import SourceBreakdown from '../components/reports/SourceBreakdown'
import RepPerformanceTable from '../components/reports/RepPerformanceTable'

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null)
    const [userRole, setUserRole] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics')
                setDashboardData(res.data.data)
                setUserRole((res.data.role || '').toLowerCase())
            } catch (error) {
                console.error('Failed to load dashboard metrics:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

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
            transactionCount = 0,
        } = dashboardData || {}
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

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                        <StatCard
                            title='Total Lifetime Collections'
                            value={`₹${totalCollected.toLocaleString('en-IN')}`}
                            icon={FiDollarSign}
                            colorClass='bg-green-50 text-green-600'
                        />
                        <StatCard
                            title="Today's Collections"
                            value={`₹${todayCollected.toLocaleString('en-IN')}`}
                            icon={FiTrendingUp}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Total Ledger Transactions'
                            value={transactionCount}
                            icon={FiCreditCard}
                            colorClass='bg-purple-50 text-purple-600'
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-6 mb-8'>
                        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between'>
                            <div>
                                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                                    Operations
                                </p>
                                <h3 className='text-lg font-bold text-gray-900 mt-1'>
                                    Fee Payment Ledger
                                </h3>
                                <p className='text-sm text-gray-500 mt-1'>
                                    Record and inspect student fee transactions.
                                </p>
                            </div>
                            <a
                                href='/admin/payments'
                                className='px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors'
                            >
                                Open Ledger
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================
    // 1. FACULTY DASHBOARD VIEW
    // ==========================================
    if (userRole === 'faculty') {
        const {
            totalStudents,
            activeStudents,
            totalCollectedFees,
            collectionRate,
            studentsList,
        } = dashboardData || {}
        return (
            <div className='bg-gray-50 min-h-screen py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='mb-8'>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Faculty Academic Dashboard
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Monitor your active student roster and fee
                            progression.
                        </p>
                    </div>
                    {/* Simplified for brevity (keep exact code from previous version here) */}
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
                    {/* Simplified for brevity (keep exact code from previous version here) */}
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
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
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
