// src/components/dashboard/RecentLeadsTable.jsx
import StatusBadge from '../common/StatusBadge'

const RecentLeadsTable = ({ leads }) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='flex justify-between items-center px-6 py-5 border-b border-gray-100'>
                <h3 className='font-bold text-gray-900'>Recent Leads</h3>
                <a
                    href='/leads'
                    className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors'
                >
                    View All Leads &rarr;
                </a>
            </div>
            <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='bg-gray-50 text-gray-900 text-xs uppercase tracking-wider font-bold'>
                            <th className='px-6 py-3 font-bold'>Full Name</th>
                            <th className='px-6 py-3 font-bold'>Status</th>
                            <th className='px-6 py-3 font-bold'>Contact</th>
                            <th className='px-6 py-3 text-right font-bold'>
                                Value
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {leads && leads.length > 0 ? (
                            leads.map((lead) => (
                                <tr
                                    key={lead._id}
                                    className='hover:bg-gray-50 transition-colors'
                                >
                                    <td className='px-6 py-4'>
                                        <div className='font-medium text-gray-900'>
                                            {lead.fullName}
                                        </div>
                                    </td>
                                    <td className='px-6 py-4'>
                                        <StatusBadge status={lead.status} />
                                    </td>
                                    <td className='px-6 py-4 text-gray-500'>
                                        {lead.phone}
                                    </td>
                                    <td className='px-6 py-4 text-right font-medium text-gray-900'>
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
