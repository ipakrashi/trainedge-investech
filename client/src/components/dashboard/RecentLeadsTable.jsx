// src/components/dashboard/RecentLeadsTable.jsx
import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge'

const RecentLeadsTable = ({ leads, onSelectLead }) => {
    const hasLeads = leads && leads.length > 0

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            {/* Header */}
            <div className='flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100'>
                <h3 className='font-bold text-gray-900 text-base sm:text-lg'>
                    Recent Leads
                </h3>
                <Link
                    to='/leads'
                    className='text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors'
                >
                    View All Leads &rarr;
                </Link>
            </div>

            {/* 1. MOBILE CARD VIEW (< md screens) */}
            <div className='block md:hidden divide-y divide-gray-100'>
                {hasLeads ? (
                    leads.map((lead) => (
                        <div
                            key={lead._id}
                            onClick={() => onSelectLead && onSelectLead(lead)}
                            className='p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer space-y-2'
                        >
                            {/* Top row: Name & Status Badge */}
                            <div className='flex items-center justify-between gap-2'>
                                <span className='font-semibold text-gray-900 text-sm truncate'>
                                    {lead.fullName}
                                </span>
                                <div className='flex-shrink-0'>
                                    <StatusBadge status={lead.status} />
                                </div>
                            </div>

                            {/* Bottom row: Phone & Value */}
                            <div className='flex items-center justify-between text-xs text-gray-500 pt-0.5'>
                                <span className='truncate mr-2'>
                                    {lead.phone || 'No phone'}
                                </span>
                                <span className='font-bold text-gray-900 text-sm flex-shrink-0'>
                                    ₹
                                    {(lead.estimatedValue || 0).toLocaleString(
                                        'en-IN',
                                    )}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='px-4 py-8 text-center text-sm text-gray-500'>
                        No recent leads found.
                    </div>
                )}
            </div>

            {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
            <div className='hidden md:block overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='bg-gray-50 text-gray-900 text-xs uppercase tracking-wider font-bold border-b border-gray-100'>
                            <th className='px-6 py-3'>Full Name</th>
                            <th className='px-6 py-3'>Status</th>
                            <th className='px-6 py-3'>Contact</th>
                            <th className='px-6 py-3 text-right'>Value</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {hasLeads ? (
                            leads.map((lead) => (
                                <tr
                                    key={lead._id}
                                    onClick={() =>
                                        onSelectLead && onSelectLead(lead)
                                    }
                                    className='hover:bg-gray-50 transition-colors cursor-pointer group'
                                >
                                    <td className='px-6 py-4'>
                                        <div className='font-medium text-gray-900 group-hover:text-blue-600 transition-colors'>
                                            {lead.fullName}
                                        </div>
                                    </td>
                                    <td className='px-6 py-4'>
                                        <StatusBadge status={lead.status} />
                                    </td>
                                    <td className='px-6 py-4 text-gray-500'>
                                        {lead.phone || '-'}
                                    </td>
                                    <td className='px-6 py-4 text-right font-semibold text-gray-900'>
                                        ₹
                                        {(
                                            lead.estimatedValue || 0
                                        ).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan='4'
                                    className='px-6 py-8 text-center text-gray-500'
                                >
                                    No recent leads found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RecentLeadsTable
