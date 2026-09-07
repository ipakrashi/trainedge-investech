// src/components/reports/views/SalesReportView.jsx
import { FiDollarSign, FiTrendingUp, FiTarget, FiAward } from 'react-icons/fi'
import StatCard from '../../common/StatCard'
import ConversionFunnel from '../ConversionFunnel'
import SourceBreakdown from '../SourceBreakdown'
import RepPerformanceTable from '../RepPerformanceTable'

const SalesReportView = ({ salesReportData }) => {
    return (
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
                <ConversionFunnel funnelData={salesReportData.funnel} />
                <SourceBreakdown sources={salesReportData.sources} />
            </div>

            <RepPerformanceTable teamData={salesReportData.team} />
        </>
    )
}

export default SalesReportView
