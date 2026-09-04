// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import {
    FiUsers,
    FiTrendingUp,
    FiDollarSign,
    FiActivity,
    FiCheckCircle,
} from 'react-icons/fi'
import api from '../api/axios'
import StatCard from '../components/common/StatCard'
import RecentLeadsTable from '../components/dashboard/RecentLeadsTable'
import FollowUpList from '../components/dashboard/FollowUpList'
import ConversionFunnel from '../components/dashboard/ConversionFunnel'
// REFRACTORED PATHS: Pointing to components/reports/ where these components reside
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
                setUserRole(res.data.role)
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
    // 1. FACULTY DASHBOARD VIEW
    // ==========================================
    if (userRole === 'faculty') {
        const {
            totalStudents,
            activeStudents,
            totalAssignedFees,
            totalCollectedFees,
            collectionRate,
            studentsList,
        } = dashboardData

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

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
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
                        <StatCard
                            title='Collected Revenue'
                            value={`₹${totalCollectedFees.toLocaleString('en-IN')}`}
                            icon={FiDollarSign}
                            colorClass='bg-purple-50 text-purple-600'
                        />
                        <StatCard
                            title='Collection Rate'
                            value={`${collectionRate}%`}
                            icon={FiTrendingUp}
                            colorClass='bg-orange-50 text-orange-600'
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
                                        <th className='px-6 py-3 text-right font-medium'>
                                            Payment Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {studentsList.map((s) => (
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
                                                {s.enrolledCourses.map((c) => (
                                                    <span
                                                        key={c._id}
                                                        className='bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs mr-1 inline-block'
                                                    >
                                                        {c.courseTitle}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className='px-6 py-4 text-right'>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-bold ${s.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                                                >
                                                    {s.paymentStatus} (₹
                                                    {s.paidAmount}/₹{s.totalFee}
                                                    )
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
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
        } = dashboardData

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

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        <div className='lg:col-span-2 space-y-8'>
                            <RecentLeadsTable leads={recentLeads} />
                        </div>
                        <div className='space-y-8'>
                            <FollowUpList tasks={pendingFollowUps} />
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
    } = dashboardData

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='mb-8'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Admin Executive Overview
                    </h1>
                    <p className='text-gray-500 text-sm mt-1'>
                        Enterprise-wide visibility into acquisition velocity and
                        revenue performance.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <StatCard
                        title='Total Institute Leads'
                        value={totalLeads}
                        icon={FiUsers}
                        colorClass='bg-blue-50 text-blue-600'
                    />
                    <StatCard
                        title='Global Active Pipeline'
                        value={activePipeline}
                        icon={FiDollarSign}
                        colorClass='bg-green-50 text-green-600'
                    />
                    <StatCard
                        title='Overall Conversion'
                        value={conversionRate}
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

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    <ConversionFunnel funnelData={funnelData} />
                    <SourceBreakdown sources={sources} />
                </div>

                <div className='space-y-8'>
                    <RepPerformanceTable teamData={teamData} />
                    <RecentLeadsTable leads={recentLeads} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
