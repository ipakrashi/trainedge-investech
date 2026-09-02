import { FiDownload, FiCalendar } from 'react-icons/fi'

const ReportsHeader = ({ timeRange, setTimeRange }) => {
    return (
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
            <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Analytics & Reports
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Evaluate lead conversions, source performance, and sales
                    representative velocity.
                </p>
            </div>

            <div className='flex items-center gap-3 w-full sm:w-auto'>
                <div className='relative w-full sm:w-auto'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                        <FiCalendar />
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className='pl-9 pr-8 py-2 w-full sm:w-auto border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500'
                    >
                        <option value='7d'>Last 7 Days</option>
                        <option value='30d'>Last 30 Days</option>
                        <option value='90d'>Last Quarter</option>
                        <option value='1y'>Past Year</option>
                    </select>
                </div>

                <button className='flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap'>
                    <FiDownload className='mr-2 text-gray-500' />
                    Export CSV
                </button>
            </div>
        </div>
    )
}

export default ReportsHeader
