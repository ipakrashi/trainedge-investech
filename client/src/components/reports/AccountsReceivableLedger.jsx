// src/components/reports/AccountsReceivableLedger.jsx
import { FiLayers, FiSearch, FiFilter, FiPlus } from 'react-icons/fi'

const AccountsReceivableLedger = ({
    students,
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onCollectFeeClick,
}) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8'>
            {/* Header Toolbar */}
            <div className='p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50'>
                <div>
                    <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                        <FiLayers className='text-blue-600' /> Active Accounts
                        Receivable Ledger
                    </h3>
                    <p className='text-sm text-gray-500'>
                        Identify due balances and log new fee collections.
                    </p>
                </div>
                <div className='flex gap-3 w-full lg:w-auto'>
                    <div className='relative w-full sm:w-auto'>
                        <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <input
                            type='text'
                            placeholder='Search student...'
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 outline-none'
                        />
                    </div>
                    <div className='relative w-full sm:w-auto'>
                        <FiFilter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                onStatusFilterChange(e.target.value)
                            }
                            className='w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 appearance-none outline-none'
                        >
                            <option value='ALL'>All Accounts</option>
                            <option value='DUE'>Balance Due</option>
                            <option value='PAID'>Fully Paid</option>
                        </select>
                    </div>
                    <button
                        onClick={() => onCollectFeeClick(null)}
                        className='flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 whitespace-nowrap shadow-sm transition-colors'
                    >
                        <FiPlus className='mr-1' /> Collect Fee
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className='overflow-x-auto max-h-[600px]'>
                <table className='w-full text-left whitespace-nowrap border-collapse'>
                    <thead className='sticky top-0 bg-white shadow-sm z-10'>
                        <tr className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-200'>
                            <th className='px-6 py-4'>STUDENT INFO</th>
                            <th className='px-6 py-4'>ENROLLED COURSES</th>
                            <th className='px-6 py-4 text-right'>TOTAL FEE</th>
                            <th className='px-6 py-4 text-right'>COLLECTED</th>
                            <th className='px-6 py-4 text-right'>AMOUNT DUE</th>
                            <th className='px-6 py-4 text-center'>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100'>
                        {students.length > 0 ? (
                            students.map((student) => {
                                const total = student.totalFee || 0
                                const paid = student.paidAmount || 0
                                const due = total - paid

                                return (
                                    <tr
                                        key={student._id}
                                        className='hover:bg-gray-50 text-sm transition-colors'
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
                                        <td className='px-6 py-4 text-gray-600 text-xs'>
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
                                                className={
                                                    due > 0
                                                        ? 'text-red-600 bg-red-50 px-2 py-1 rounded'
                                                        : 'text-gray-400'
                                                }
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
