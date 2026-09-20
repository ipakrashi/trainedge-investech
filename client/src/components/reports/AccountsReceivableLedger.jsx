// src/components/reports/AccountsReceivableLedger.jsx
import {
    FiLayers,
    FiSearch,
    FiFilter,
    FiPlus,
    FiMail,
    FiPhone,
    FiBookOpen,
} from 'react-icons/fi'

const AccountsReceivableLedger = ({
    students = [],
    searchQuery = '',
    onSearchChange,
    statusFilter = 'ALL',
    onStatusFilterChange,
    onCollectFeeClick,
}) => {
    const hasStudents = students && students.length > 0

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8'>
            {/* Header Toolbar */}
            <div className='p-4 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50'>
                <div>
                    <h3 className='font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2'>
                        <FiLayers className='text-blue-600 flex-shrink-0' />{' '}
                        Active Accounts Receivable Ledger
                    </h3>
                    <p className='text-xs sm:text-sm text-gray-500 mt-0.5'>
                        Identify outstanding balances and log fee collections.
                    </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full lg:w-auto'>
                    {/* Search Input */}
                    <div className='relative w-full sm:w-64'>
                        <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <input
                            type='text'
                            placeholder='Search student...'
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className='w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className='relative w-full sm:w-44'>
                        <FiFilter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' />
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                onStatusFilterChange(e.target.value)
                            }
                            className='w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none outline-none'
                        >
                            <option value='ALL'>All Accounts</option>
                            <option value='DUE'>Balance Due</option>
                            <option value='PAID'>Fully Paid</option>
                        </select>
                    </div>

                    {/* Collect Fee Button */}
                    <button
                        onClick={() => onCollectFeeClick(null)}
                        className='inline-flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors whitespace-nowrap'
                    >
                        <FiPlus className='mr-1.5' /> Collect Fee
                    </button>
                </div>
            </div>

            {/* 1. MOBILE CARD VIEW (< md screens) */}
            <div className='block md:hidden divide-y divide-gray-100 max-h-[600px] overflow-y-auto'>
                {hasStudents ? (
                    students.map((student) => {
                        const total = student.totalFee || 0
                        const paid = student.paidAmount || 0
                        const due = total - paid

                        return (
                            <div
                                key={student._id}
                                className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                            >
                                {/* Top Row: Student Identity & Payment Action */}
                                <div className='flex items-start justify-between gap-3'>
                                    <div>
                                        <div className='font-bold text-gray-900 text-sm'>
                                            {student.fullName}
                                        </div>
                                        <div className='text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate'>
                                            <FiMail className='text-gray-400 flex-shrink-0' />
                                            <span className='truncate'>
                                                {student.email}
                                            </span>
                                        </div>
                                        {student.phone && (
                                            <div className='text-xs text-gray-400 flex items-center gap-1.5 mt-0.5'>
                                                <FiPhone className='text-gray-400 flex-shrink-0' />
                                                <span>{student.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        disabled={due <= 0}
                                        onClick={() =>
                                            onCollectFeeClick(student._id)
                                        }
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex-shrink-0 ${
                                            due > 0
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {due > 0 ? 'Log Payment' : 'Cleared'}
                                    </button>
                                </div>

                                {/* Enrolled Courses Tag */}
                                <div className='text-xs text-gray-600 flex items-start gap-1.5'>
                                    <FiBookOpen className='text-gray-400 mt-0.5 flex-shrink-0' />
                                    <span className='line-clamp-2'>
                                        {student.enrolledCourses
                                            ?.map((c) => c.courseTitle)
                                            .join(', ') || 'No Courses'}
                                    </span>
                                </div>

                                {/* Ledger Metrics Grid */}
                                <div className='grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-center'>
                                    <div>
                                        <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                            Total Fee
                                        </span>
                                        <span className='font-semibold text-gray-800 text-xs sm:text-sm mt-0.5 block'>
                                            ₹{total.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                            Collected
                                        </span>
                                        <span className='font-semibold text-green-600 text-xs sm:text-sm mt-0.5 block'>
                                            ₹{paid.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                            Amount Due
                                        </span>
                                        <span
                                            className={`font-bold text-xs sm:text-sm mt-0.5 block ${
                                                due > 0
                                                    ? 'text-red-600'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            ₹{due.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className='p-8 text-center text-sm text-gray-500'>
                        No outstanding accounts match your filters.
                    </div>
                )}
            </div>

            {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
            <div className='hidden md:block overflow-x-auto max-h-[600px]'>
                <table className='w-full text-left whitespace-nowrap border-collapse'>
                    <thead className='sticky top-0 bg-white shadow-sm z-10'>
                        <tr className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-200'>
                            <th className='px-6 py-4'>Student Info</th>
                            <th className='px-6 py-4'>Enrolled Courses</th>
                            <th className='px-6 py-4 text-right'>Total Fee</th>
                            <th className='px-6 py-4 text-right'>Collected</th>
                            <th className='px-6 py-4 text-right'>Amount Due</th>
                            <th className='px-6 py-4 text-center'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {hasStudents ? (
                            students.map((student) => {
                                const total = student.totalFee || 0
                                const paid = student.paidAmount || 0
                                const due = total - paid

                                return (
                                    <tr
                                        key={student._id}
                                        className='hover:bg-gray-50 transition-colors'
                                    >
                                        <td className='px-6 py-4'>
                                            <div className='font-bold text-gray-900'>
                                                {student.fullName}
                                            </div>
                                            <div className='text-gray-500 text-xs'>
                                                {student.email}
                                            </div>
                                            <div className='text-gray-400 text-xs'>
                                                {student.phone}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 text-gray-600 text-xs max-w-xs truncate'>
                                            {student.enrolledCourses
                                                ?.map((c) => c.courseTitle)
                                                .join(', ') || 'N/A'}
                                        </td>
                                        <td className='px-6 py-4 text-right font-medium text-gray-900'>
                                            ₹{total.toLocaleString('en-IN')}
                                        </td>
                                        <td className='px-6 py-4 text-right font-medium text-green-600'>
                                            ₹{paid.toLocaleString('en-IN')}
                                        </td>
                                        <td className='px-6 py-4 text-right font-bold'>
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs inline-block ${
                                                    due > 0
                                                        ? 'text-red-700 bg-red-50 border border-red-100'
                                                        : 'text-gray-400'
                                                }`}
                                            >
                                                ₹{due.toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 text-center'>
                                            <button
                                                disabled={due <= 0}
                                                onClick={() =>
                                                    onCollectFeeClick(
                                                        student._id,
                                                    )
                                                }
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                                    due > 0
                                                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {due > 0
                                                    ? 'Log Payment'
                                                    : 'Cleared'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan='6'
                                    className='px-6 py-12 text-center text-gray-500'
                                >
                                    No outstanding accounts match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AccountsReceivableLedger
