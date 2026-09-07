// src/components/reports/views/FinanceReportView.jsx
import {
    FiDollarSign,
    FiTrendingUp,
    FiTarget,
    FiCreditCard,
    FiAlertCircle,
} from 'react-icons/fi'
import StatCard from '../../common/StatCard'
import AccountsReceivableLedger from '../AccountsReceivableLedger'

const FinanceReportView = ({
    financeReportData,
    timeRange,
    filteredARStudents,
    arSearchQuery,
    setArSearchQuery,
    arStatusFilter,
    setArStatusFilter,
    onCollectFeeClick,
}) => {
    return (
        <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
                <StatCard
                    title='Expected Pipeline Revenue'
                    value={financeReportData.expectedRevenue}
                    icon={FiTarget}
                    colorClass='bg-purple-50 text-purple-600'
                />
                <StatCard
                    title={
                        timeRange === 'all'
                            ? 'Total Lifetime Collections'
                            : 'Period Collections'
                    }
                    value={financeReportData.totalRevenue}
                    icon={FiDollarSign}
                    colorClass='bg-green-50 text-green-600'
                />
                <StatCard
                    title='Total Outstanding Dues'
                    value={financeReportData.totalOutstanding}
                    icon={FiAlertCircle}
                    colorClass='bg-red-50 text-red-600'
                />
                <StatCard
                    title="Today's Collections"
                    value={financeReportData.todayCollected}
                    icon={FiTrendingUp}
                    colorClass='bg-blue-50 text-blue-600'
                />
                <StatCard
                    title='Ledger Transactions'
                    value={financeReportData.transactionCount}
                    icon={FiCreditCard}
                    colorClass='bg-indigo-50 text-indigo-600'
                />
            </div>

            <AccountsReceivableLedger
                students={filteredARStudents}
                searchQuery={arSearchQuery}
                onSearchChange={setArSearchQuery}
                statusFilter={arStatusFilter}
                onStatusFilterChange={setArStatusFilter}
                onCollectFeeClick={onCollectFeeClick}
            />
        </>
    )
}

export default FinanceReportView
