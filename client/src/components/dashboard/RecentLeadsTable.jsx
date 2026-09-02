import { Link } from 'react-router-dom'
import { FiMoreVertical } from 'react-icons/fi'

const RecentLeadsTable = ({ leads }) => (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='px-6 py-5 border-b border-gray-100 flex justify-between items-center'>
            <h3 className='font-bold text-gray-900'>Recent Leads</h3>
            <Link
                to='/leads'
                className='text-sm text-blue-600 hover:text-blue-700 font-medium'
            >
                View All
            </Link>
        </div>
        <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
                <thead>
                    <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider'>
                        <th className='px-6 py-3 font-medium'>Name</th>
                        <th className='px-6 py-3 font-medium'>Status</th>
                        <th className='px-6 py-3 font-medium'>Value</th>
                        <th className='px-6 py-3 font-medium'>Added</th>
                        <th className='px-6 py-3 text-right font-medium'>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 text-sm'>
                    {leads.map((lead) => (
                        <tr
                            key={lead._id}
                            className='hover:bg-gray-50 transition-colors'
                        >
                            <td className='px-6 py-4'>
                                <div className='font-medium text-gray-900'>
                                    {lead.fullName}
                                </div>
                                <div className='text-gray-500 text-xs'>
                                    {lead.email}
                                </div>
                            </td>
                            <td className='px-6 py-4'>
                                <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border
                                            ${lead.status === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                            ${lead.status === 'CONTACTED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                                            ${lead.status === 'QUALIFIED' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                                            ${lead.status === 'DEMO_SCHEDULED' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                            ${lead.status === 'DEMO_ATTENDED' ? 'bg-teal-50 text-teal-700 border-teal-200' : ''}
                                            ${lead.status === 'ENROLLED' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                            ${lead.status === 'LOST' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                            ${lead.status === 'JUNK' ? 'bg-gray-100 text-gray-700 border-gray-300' : ''}
                                        `}
                                >
                                    {lead.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className='px-6 py-4 text-gray-700 font-medium'>
                                ₹{lead.estimatedValue || 0}
                            </td>
                            <td className='px-6 py-4 text-gray-500'>
                                {new Date(lead.createdAt).toLocaleDateString()}
                            </td>
                            <td className='px-6 py-4 text-right'>
                                <Link
                                    to='/leads'
                                    className='text-gray-400 hover:text-gray-900'
                                >
                                    <FiMoreVertical className='text-lg' />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {leads.length === 0 && (
                <div className='p-8 text-center text-gray-500'>
                    No recent leads found.
                </div>
            )}
        </div>
    </div>
)

export default RecentLeadsTable
