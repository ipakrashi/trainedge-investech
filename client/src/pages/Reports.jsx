import { useState, useEffect, useMemo } from 'react'
import {
    FiDollarSign,
    FiTrendingUp,
    FiTarget,
    FiAward,
    FiDownload,
} from 'react-icons/fi'
import api from '../api/axios'
import StatCard from '../components/common/StatCard'
// Keep your existing child component imports
import ConversionFunnel from '../components/reports/ConversionFunnel'
import SourceBreakdown from '../components/reports/SourceBreakdown'
import RepPerformanceTable from '../components/reports/RepPerformanceTable'

const Reports = () => {
    const [timeRange, setTimeRange] = useState('30d')
    const [allLeads, setAllLeads] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch all leads once on mount
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true)
                // Fetch a large dataset to ensure accurate historical reporting
                const response = await api.get('/leads?limit=5000')
                setAllLeads(response.data.data || [])
            } catch (error) {
                console.error('Failed to fetch reporting data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllData()
    }, [])

    // Memoize the data processing so it recalculates instantly when timeRange changes
    const { filteredLeads, reportData } = useMemo(() => {
        // 1. Filter by Time Range
        const now = new Date()
        const filtered = allLeads.filter((lead) => {
            if (timeRange === 'all') return true
            const leadDate = new Date(lead.createdAt)
            const daysDiff = (now - leadDate) / (1000 * 60 * 60 * 24)
            if (timeRange === '30d') return daysDiff <= 30
            if (timeRange === '90d') return daysDiff <= 90
            if (timeRange === '180d') return daysDiff <= 180
            if (timeRange === '1y') return daysDiff <= 365
            return true
        })

        const totalLeads = filtered.length
        const wonLeads = filtered.filter((l) => l.status === 'ENROLLED')

        // 2. Calculate Top Level Metrics
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

        // Calculate average days from creation to last update (proxy for sales cycle)
        const cycleDaysSum = wonLeads.reduce((sum, l) => {
            const created = new Date(l.createdAt)
            const updated = new Date(l.updatedAt)
            return sum + (updated - created) / (1000 * 60 * 60 * 24)
        }, 0)
        const avgCycleDays =
            wonLeads.length > 0
                ? (cycleDaysSum / wonLeads.length).toFixed(1)
                : 0

        // 3. Process Funnel Data
        // Defining broad stages based on your schema
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

        // 4. Process Source Breakdown
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
                percentage: Math.round(
                    (sourceMap[key].count / totalLeads) * 100,
                ),
                revenue: sourceMap[key].revenue,
                conversionRate:
                    Math.round(
                        (sourceMap[key].wonCount / sourceMap[key].count) * 100,
                    ) || 0,
            }))
            .sort((a, b) => b.totalLeads - a.totalLeads)

        // 5. Process Team Performance
        const teamMap = {}
        filtered.forEach((l) => {
            const name = l.assignedTo
                ? `${l.assignedTo.firstName || ''} ${l.assignedTo.lastName || ''}`.trim() ||
                  l.assignedTo.email
                : 'Unassigned'
            const role = l.assignedTo ? l.assignedTo.role : 'N/A'
            const id = l.assignedTo ? l.assignedTo._id : 'unassigned'

            if (!teamMap[id])
                teamMap[id] = {
                    id,
                    name,
                    role,
                    assigned: 0,
                    closed: 0,
                    revenue: 0,
                }
            teamMap[id].assigned++

            if (l.status === 'ENROLLED') {
                teamMap[id].closed++
                teamMap[id].revenue += l.estimatedValue || 0
            }
            teamMap[id].winRate = (
                (teamMap[id].closed / teamMap[id].assigned) *
                100
            ).toFixed(1)
        })

        const team = Object.values(teamMap).sort(
            (a, b) => b.revenue - a.revenue,
        )

        return {
            filteredLeads: filtered,
            reportData: {
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

    // CSV Export Logic
    const handleExportCSV = () => {
        if (!filteredLeads.length)
            return alert('No data to export for this time range.')

        const headers = [
            'Full Name',
            'Email',
            'Phone',
            'City',
            'Source',
            'Status',
            'Experience',
            'Estimated Value',
            'Created At',
        ]

        const csvRows = filteredLeads.map((lead) =>
            [
                lead.fullName || '',
                lead.email || '',
                lead.phone || '',
                lead.city || '',
                lead.source || '',
                lead.status || '',
                lead.experienceLevel || '',
                lead.estimatedValue || 0,
                new Date(lead.createdAt).toLocaleDateString('en-IN'),
            ]
                .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                .join(','),
        ) // Escape quotes

        const csvContent = [headers.join(','), ...csvRows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')

        link.href = URL.createObjectURL(blob)
        link.download = `trainEdge_leads_report_${timeRange}.csv`
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
                {/* Inline Reports Header with Time Filter & CSV Export */}
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Analytics & Reports
                        </h1>
                        <p className='text-sm text-gray-500 mt-1'>
                            Showing data for{' '}
                            <span className='font-semibold text-blue-600'>
                                {filteredLeads.length}
                            </span>{' '}
                            leads.
                        </p>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className='border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50'
                        >
                            <option value='30d'>Last 30 Days</option>
                            <option value='90d'>Last 90 Days</option>
                            <option value='180d'>Last 6 Months</option>
                            <option value='1y'>Last Year</option>
                            <option value='all'>All Time</option>
                        </select>

                        <button
                            onClick={handleExportCSV}
                            className='flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors'
                        >
                            <FiDownload className='mr-2' />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* High-Level Conversion KPI Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <StatCard
                        title='Total Closed Won'
                        value={reportData.metrics.wonRevenue}
                        icon={FiDollarSign}
                        colorClass='bg-green-50 text-green-600'
                    />
                    <StatCard
                        title='Opportunity Win Rate'
                        value={reportData.metrics.winRate}
                        icon={FiTarget}
                        colorClass='bg-blue-50 text-blue-600'
                    />
                    <StatCard
                        title='Average Deal Size'
                        value={reportData.metrics.avgDealSize}
                        icon={FiAward}
                        colorClass='bg-purple-50 text-purple-600'
                    />
                    <StatCard
                        title='Sales Cycle (Days)'
                        value={reportData.metrics.avgCycleDays}
                        icon={FiTrendingUp}
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
