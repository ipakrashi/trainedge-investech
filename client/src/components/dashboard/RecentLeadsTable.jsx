import { Link } from 'react-router-dom'

const RecentLeadsTable = ({ leads }) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='px-6 py-5 border-b border-gray-100 flex justify-between items-center'>
                <h3 className='font-bold text-gray-900'>Recent Leads</h3>
                <Link
                    to='/leads'
                    className='text-sm text-blue-600 hover:text-blue-800 font-medium'
                >
                    View All Leads &rarr;
                </Link>
            </div>
            <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider'>
                            <th className='px-6 py-3 font-medium'>Full Name</th>
                            <th className='px-6 py-3 font-medium'>Status</th>
                            <th className='px-6 py-3 font-medium'>Contact</th>
                            <th className='px-6 py-3 text-right font-medium'>
                                Value
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {leads?.map((lead) => (
                            <tr
                                key={lead._id}
                                className='hover:bg-gray-50 transition-colors'
                            >
                                <td className='px-6 py-4 font-medium text-gray-900'>
                                    {lead.fullName}
                                </td>
                                <td className='px-6 py-4'>
                                    <span className='bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold'>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className='px-6 py-4 text-gray-500'>
                                    {lead.phone}
                                </td>
                                <td className='px-6 py-4 text-right font-medium text-gray-900'>
                                    ₹
                                    {(lead.estimatedValue || 0).toLocaleString(
                                        'en-IN',
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(!leads || leads.length === 0) && (
                            <tr>
                                <td
                                    colSpan='4'
                                    className='px-6 py-8 text-center text-gray-400 text-sm'
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
