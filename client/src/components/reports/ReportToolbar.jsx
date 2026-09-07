// src/components/reports/ReportToolbar.jsx
import { FiDownload } from 'react-icons/fi'

const ReportToolbar = ({
    activeTab,
    timeRange,
    setTimeRange,
    recordCount,
    onExport,
}) => {
    return (
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
            <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Analytics & Reports
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Showing records for{' '}
                    <span className='font-semibold text-blue-600'>
                        {recordCount}
                    </span>{' '}
                    metrics.
                </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
                {activeTab !== 'academic' && (
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className='border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-blue-500 bg-gray-50 outline-none'
                    >
                        <option value='30d'>Last 30 Days</option>
                        <option value='90d'>Last 90 Days</option>
                        <option value='180d'>Last 6 Months</option>
                        <option value='1y'>Last Year</option>
                        <option value='all'>All Time</option>
                    </select>
                )}
                <button
                    onClick={onExport}
                    className='flex items-center justify-center py-2 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors'
                >
                    <FiDownload className='mr-2' /> Export CSV
                </button>
            </div>
        </div>
    )
}

export default ReportToolbar
