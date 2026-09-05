// src/components/leads/LeadsTable.jsx
import { FiEdit2, FiTrash2, FiActivity, FiCalendar } from 'react-icons/fi'

const LeadsTable = ({
    leads,
    onEditClick,
    onDeleteClick,
    onViewActivityClick,
    isAdmin,
}) => {
    const formatFollowUpDate = (dateString, status) => {
        // Hide follow-up warnings for terminal lead statuses
        if (['ENROLLED', 'LOST', 'JUNK'].includes(status)) {
            return <span className='text-gray-400 font-medium text-xs'>-</span>
        }

        if (!dateString)
            return (
                <span className='text-gray-400 italic text-xs'>
                    Not scheduled
                </span>
            )

        const date = new Date(dateString)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        date.setHours(0, 0, 0, 0)

        const isOverdue = date < today
        const isToday = date.getTime() === today.getTime()

        let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-200'
        if (isOverdue)
            badgeStyle = 'bg-red-50 text-red-700 border-red-200 font-semibold'
        if (isToday)
            badgeStyle =
                'bg-amber-50 text-amber-700 border-amber-200 font-semibold'

        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${badgeStyle}`}
            >
                <FiCalendar className='mr-1' />
                {new Date(dateString).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })}
                {isOverdue && ' (Overdue)'}
                {isToday && ' (Today)'}
            </span>
        )
    }

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-176px)] flex flex-col overflow-hidden'>
            <div className='overflow-auto flex-1'>
                <table className='w-full text-left border-collapse'>
                    <thead className='sticky top-0 z-10 bg-gray-50 shadow-sm'>
                        <tr className='text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                            <th className='px-6 py-4 font-medium'>Lead Info</th>
                            <th className='px-6 py-4 font-medium'>Status</th>
                            <th className='px-6 py-4 font-medium'>Source</th>
                            <th className='px-6 py-4 font-medium'>
                                Lead Owner
                            </th>
                            <th className='px-6 py-4 font-medium'>
                                Next Follow-Up
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
                                    <td className='px-6 py-4'>
                                        {formatFollowUpDate(
                                            lead.nextFollowUpDate,
                                            lead.status,
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
                                    colSpan='7'
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
