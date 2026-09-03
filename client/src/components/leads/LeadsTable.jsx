import { FiEdit2, FiTrash2, FiActivity } from 'react-icons/fi'

const LeadsTable = ({
    leads,
    onEditClick,
    onDeleteClick,
    onViewActivityClick,
    isAdmin, // New prop to check role
}) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                            <th className='px-6 py-4 font-medium'>Lead Info</th>
                            <th className='px-6 py-4 font-medium'>Status</th>
                            <th className='px-6 py-4 font-medium'>Source</th>
                            <th className='px-6 py-4 font-medium'>
                                Lead Owner
                            </th>
                            <th className='px-6 py-4 font-medium'>
                                Estimated Value
                            </th>
                            <th className='px-6 py-4 text-right font-medium'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {leads.length > 0 ? (
                            leads.map((lead) => (
                                <tr
                                    key={lead._id}
                                    className='hover:bg-gray-50 transition-colors'
                                >
                                    <td className='px-6 py-4'>
                                        <div className='font-medium text-gray-900'>
                                            {lead.fullName}
                                        </div>
                                        <div className='text-gray-500 text-xs mt-0.5'>
                                            {lead.email}
                                        </div>
                                        <div className='text-gray-400 text-xs'>
                                            {lead.phone}
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
                                    <td className='px-6 py-4 text-gray-600 text-xs font-medium'>
                                        {lead.source.replace('_', ' ')}
                                    </td>
                                    <td className='px-6 py-4 text-gray-700 font-medium'>
                                        {lead.assignedTo ? (
                                            lead.assignedTo.email
                                        ) : (
                                            <span className='text-gray-400 italic'>
                                                Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td className='px-6 py-4 font-medium text-gray-900'>
                                        &#8377; {lead.estimatedValue || 0}
                                    </td>

                                    <td className='px-6 py-4 text-right space-x-3'>
                                        <button
                                            onClick={() =>
                                                onViewActivityClick(lead)
                                            }
                                            className='text-gray-400 hover:text-emerald-600 transition-colors'
                                            title='Activities & Timeline'
                                        >
                                            <FiActivity className='text-lg inline' />
                                        </button>
                                        <button
                                            onClick={() => onEditClick(lead)}
                                            className='text-gray-400 hover:text-blue-600 transition-colors'
                                            title='Edit'
                                        >
                                            <FiEdit2 className='text-lg inline' />
                                        </button>

                                        {/* Conditionally render the delete button */}
                                        {isAdmin && (
                                            <button
                                                onClick={() =>
                                                    onDeleteClick(lead._id)
                                                }
                                                className='text-gray-400 hover:text-red-600 transition-colors'
                                                title='Delete'
                                            >
                                                <FiTrash2 className='text-lg inline' />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan='6'
                                    className='px-6 py-12 text-center text-gray-500'
                                >
                                    No leads found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default LeadsTable
