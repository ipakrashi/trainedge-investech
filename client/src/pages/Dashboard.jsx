import { useState, useEffect } from 'react'
import { FiUsers, FiTrendingUp, FiDollarSign, FiActivity } from 'react-icons/fi'
import api from '../api/axios'
import StatCard from '../components/common/StatCard'
import RecentLeadsTable from '../components/dashboard/RecentLeadsTable'
import FollowUpList from '../components/dashboard/FollowUpList'

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        activePipeline: '₹0',
        conversionRate: '0%',
        newThisWeek: 0,
    })
    const [recentLeads, setRecentLeads] = useState([])
    const [followUps, setFollowUps] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch a large batch of leads to compute dashboard metrics
                const response = await api.get('/leads?limit=1000')
                const allLeads = response.data.data || []

                // 1. Calculate Metrics
                const totalLeads = response.data.total || allLeads.length

                // Active Pipeline: Sum of estimated values for open deals
                const activePipeline = allLeads
                    .filter(
                        (l) => !['LOST', 'JUNK', 'ENROLLED'].includes(l.status),
                    )
                    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

                // Conversion Rate: (Enrolled / Total) * 100
                const enrolledLeads = allLeads.filter(
                    (l) => l.status === 'ENROLLED',
                ).length
                const conversionRate =
                    totalLeads === 0
                        ? 0
                        : ((enrolledLeads / totalLeads) * 100).toFixed(1)

                // New This Week
                const oneWeekAgo = new Date()
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                const newThisWeek = allLeads.filter(
                    (l) => new Date(l.createdAt) > oneWeekAgo,
                ).length

                setStats({
                    totalLeads,
                    activePipeline: `₹${activePipeline.toLocaleString('en-IN')}`,
                    conversionRate: `${conversionRate}%`,
                    newThisWeek,
                })

                // 2. Extract Recent Leads (Backend already sorts by createdAt: -1)
                setRecentLeads(allLeads.slice(0, 5))

                // 3. Extract Follow-ups (Scheduled for today or overdue, skipping closed deals)
                const endOfToday = new Date()
                endOfToday.setHours(23, 59, 59, 999)

                const pendingTasks = allLeads
                    .filter((l) => {
                        if (!l.nextFollowUpDate) return false
                        if (['LOST', 'JUNK', 'ENROLLED'].includes(l.status))
                            return false
                        return new Date(l.nextFollowUpDate) <= endOfToday
                    })
                    .slice(0, 5)

                setFollowUps(pendingTasks)
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        )
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='mb-8'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Dashboard
                    </h1>
                    <p className='text-gray-500 text-sm mt-1'>
                        Welcome back. Here is what's happening with your leads
                        today.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <StatCard
                        title='Total Leads'
                        value={stats.totalLeads}
                        icon={FiUsers}
                        colorClass='bg-blue-50 text-blue-600'
                    />
                    <StatCard
                        title='Active Pipeline'
                        value={stats.activePipeline}
                        icon={FiDollarSign}
                        colorClass='bg-green-50 text-green-600'
                    />
                    <StatCard
                        title='Conversion Rate'
                        value={stats.conversionRate}
                        icon={FiTrendingUp}
                        colorClass='bg-purple-50 text-purple-600'
                    />
                    <StatCard
                        title='New This Week'
                        value={stats.newThisWeek}
                        icon={FiActivity}
                        colorClass='bg-orange-50 text-orange-600'
                    />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2 space-y-8'>
                        <RecentLeadsTable leads={recentLeads} />
                    </div>
                    <div className='space-y-8'>
                        <FollowUpList tasks={followUps} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
