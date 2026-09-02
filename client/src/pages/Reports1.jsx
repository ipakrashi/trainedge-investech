import { useState, useEffect } from 'react'
import { FiDollarSign, FiTrendingUp, FiTarget, FiAward } from 'react-icons/fi'
import StatCard from '../components/common/StatCard'
import ReportsHeader from '../components/reports/ReportsHeader'
import ConversionFunnel from '../components/reports/ConversionFunnel'
import SourceBreakdown from '../components/reports/SourceBreakdown'
import RepPerformanceTable from '../components/reports/RepPerformanceTable'

const Reports = () => {
    const [timeRange, setTimeRange] = useState('30d')
    const [reportData, setReportData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // MOCK DATA FETCHING
    useEffect(() => {
        setIsLoading(true)
        setTimeout(() => {
            setReportData({
                metrics: {
                    wonRevenue: '$78,400',
                    winRate: '28.4%',
                    avgDealSize: '$6,530',
                    avgCycleDays: '14.2',
                },
                funnel: [
                    {
                        label: 'Total Inbound Leads',
                        count: 480,
                        rate: 100,
                        dropOff: 42,
                        color: 'bg-blue-600',
                    },
                    {
                        label: 'Contacted',
                        count: 278,
                        rate: 58,
                        dropOff: 46,
                        color: 'bg-indigo-600',
                    },
                    {
                        label: 'Qualified',
                        count: 150,
                        rate: 31,
                        dropOff: 33,
                        color: 'bg-purple-600',
                    },
                    {
                        label: 'Proposals Presented',
                        count: 100,
                        rate: 21,
                        dropOff: 44,
                        color: 'bg-amber-500',
                    },
                    {
                        label: 'Closed Won',
                        count: 56,
                        rate: 12,
                        dropOff: 0,
                        color: 'bg-emerald-600',
                    },
                ],
                sources: [
                    {
                        name: 'Website Organic',
                        totalLeads: 180,
                        percentage: 38,
                        revenue: 32000,
                        conversionRate: 18,
                    },
                    {
                        name: 'Referrals',
                        totalLeads: 120,
                        percentage: 25,
                        revenue: 26400,
                        conversionRate: 22,
                    },
                    {
                        name: 'LinkedIn Outreach',
                        totalLeads: 110,
                        percentage: 23,
                        revenue: 14000,
                        conversionRate: 13,
                    },
                    {
                        name: 'Cold Sourcing',
                        totalLeads: 70,
                        percentage: 14,
                        revenue: 6000,
                        conversionRate: 9,
                    },
                ],
                team: [
                    {
                        id: 1,
                        name: 'Ananya Sharma',
                        role: 'Senior Account Executive',
                        assigned: 120,
                        closed: 38,
                        winRate: 31.6,
                        revenue: 42000,
                    },
                    {
                        id: 2,
                        name: 'Rohan Sen',
                        role: 'Inbound Specialist',
                        assigned: 140,
                        closed: 26,
                        winRate: 18.5,
                        revenue: 22400,
                    },
                    {
                        id: 3,
                        name: 'Vikram Mehta',
                        role: 'Account Executive',
                        assigned: 95,
                        closed: 18,
                        winRate: 18.9,
                        revenue: 14000,
                    },
                ],
            })
            setIsLoading(false)
        }, 600)
    }, [timeRange])

    if (isLoading || !reportData) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
            </div>
        )
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <ReportsHeader
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                />

                {/* High-Level Conversion KPI Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <StatCard
                        title='Total Closed Won'
                        value={reportData.metrics.wonRevenue}
                        icon={FiDollarSign}
                        trend={14.2}
                        trendLabel='vs prior period'
                        colorClass='bg-green-50 text-green-600'
                    />
                    <StatCard
                        title='Opportunity Win Rate'
                        value={reportData.metrics.winRate}
                        icon={FiTarget}
                        trend={3.1}
                        trendLabel='vs prior period'
                        colorClass='bg-blue-50 text-blue-600'
                    />
                    <StatCard
                        title='Average Deal Size'
                        value={reportData.metrics.avgDealSize}
                        icon={FiAward}
                        trend={-1.5}
                        trendLabel='vs prior period'
                        colorClass='bg-purple-50 text-purple-600'
                    />
                    <StatCard
                        title='Sales Cycle (Days)'
                        value={`${reportData.metrics.avgCycleDays}d`}
                        icon={FiTrendingUp}
                        trend={-8.4}
                        trendLabel='faster close'
                        colorClass='bg-orange-50 text-orange-600'
                    />
                </div>

                {/* Funnel & Channel Breakdown Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    <ConversionFunnel funnelData={reportData.funnel} />
                    <SourceBreakdown sources={reportData.sources} />
                </div>

                {/* Team Performance Table */}
                <RepPerformanceTable teamData={reportData.team} />
            </div>
        </div>
    )
}

export default Reports
