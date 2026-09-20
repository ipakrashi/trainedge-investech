// src/components/leads/LeadsTable.jsx
import {
    FiEdit2,
    FiTrash2,
    FiActivity,
    FiCalendar,
    FiUser,
    FiTag,
} from 'react-icons/fi'
import RoleBadge from '../common/RoleBadge'
import StatusBadge from '../common/StatusBadge'

const LeadsTable = ({
    leads = [],
    onEditClick,
    onDeleteClick,
    onViewActivityClick,
    isAdmin,
}) => {
    const hasLeads = leads && leads.length > 0

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
                <FiCalendar className='mr-1 flex-shrink-0' />
                <span>
                    {new Date(dateString).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                    {isOverdue && ' (Overdue)'}
                    {isToday && ' (Today)'}
                </span>
            </span>
        )
    }

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-176px)] flex flex-col overflow-hidden'>
            {/* 1. MOBILE CARD VIEW (< md screens) */}
            <div className='block md:hidden overflow-y-auto flex-1 divide-y divide-gray-100'>
                {hasLeads ? (
                    leads.map((lead) => (
                        <div
                            key={lead._id}
                            className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                        >
                            {/* Top row: Name & Status */}
                            <div className='flex items-start justify-between gap-2'>
                                <div>
                                    <h4 className='font-bold text-gray-900 text-sm'>
                                        {lead.fullName}
                                    </h4>
                                    <p className='text-xs text-gray-500 mt-0.5'>
                                        {lead.email}
                                    </p>
                                    <p className='text-xs text-gray-400'>
                                        {lead.phone || 'No contact number'}
                                    </p>
                                </div>
                                <div className='flex-shrink-0'>
                                    <StatusBadge status={lead.status} />
                                </div>
                            </div>

                            {/* Middle row: Lead Metadata Grid */}
                            <div className='grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs'>
                                <div>
                                    <span className='text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1'>
                                        <FiTag /> Source
                                    </span>
                                    <span className='font-medium text-gray-700 truncate block mt-0.5'>
                                        {lead.source
                                            ? lead.source.replace('_', ' ')
                                            : '-'}
                                    </span>
                                </div>

                                <div>
                                    <span className='text-[10px] uppercase font-bold text-gray-400 tracking-wider block'>
                                        Est. Value
                                    </span>
                                    <span className='font-bold text-gray-900 block mt-0.5'>
                                        ₹
                                        {(
                                            lead.estimatedValue || 0
                                        ).toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className='col-span-2 pt-1 border-t border-gray-200/60'>
                                    <span className='text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1'>
                                        Follow-Up
                                    </span>
                                    {formatFollowUpDate(
                                        lead.nextFollowUpDate,
                                        lead.status,
                                    )}
                                </div>

                                <div className='col-span-2 pt-1 border-t border-gray-200/60'>
                                    <span className='text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1 mb-1'>
                                        <FiUser /> Assigned Owner
                                    </span>
                                    {lead.assignedTo ? (
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <span className='text-gray-700 font-medium'>
                                                {lead.assignedTo.email}
                                            </span>
                                            <RoleBadge
                                                role={lead.assignedTo.role}
                                            />
                                        </div>
                                    ) : (
                                        <span className='text-gray-400 italic'>
                                            Unassigned
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Bottom row: Touch Action Buttons */}
                            <div className='flex items-center justify-end gap-2 pt-1'>
                                <button
                                    onClick={() => onViewActivityClick(lead)}
                                    className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors'
                                >
                                    <FiActivity /> Timeline
                                </button>
                                <button
                                    onClick={() => onEditClick(lead)}
                                    className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
                                >
                                    <FiEdit2 /> Edit
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => onDeleteClick(lead._id)}
                                        className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='px-6 py-12 text-center text-sm text-gray-500'>
                        No leads found matching your criteria.
                    </div>
                )}
            </div>

            {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
            <div className='hidden md:block overflow-auto flex-1'>
                <table className='w-full text-left border-collapse'>
                    <thead className='sticky top-0 z-10 bg-gray-50 shadow-sm'>
                        <tr className='text-gray-900 text-xs uppercase tracking-wider border-b border-gray-100'>
                            <th className='px-6 py-4 font-bold'>Lead Info</th>
                            <th className='px-6 py-4 font-bold'>Status</th>
                            <th className='px-6 py-4 font-bold'>Source</th>
                            <th className='px-6 py-4 font-bold'>Lead Owner</th>
                            <th className='px-6 py-4 font-bold'>
                                Next Follow-Up
                            </th>
                            <th className='px-6 py-4 font-bold'>
                                Estimated Value
                            </th>
                            <th className='px-6 py-4 text-right font-bold'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {hasLeads ? (
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
                                            {lead.phone || '-'}
                                        </div>
                                    </td>
                                    <td className='px-6 py-4'>
                                        <StatusBadge status={lead.status} />
                                    </td>
                                    <td className='px-6 py-4 text-gray-600 text-xs font-medium'>
                                        {lead.source
                                            ? lead.source.replace('_', ' ')
                                            : '-'}
                                    </td>
                                    <td className='px-6 py-4 text-gray-700 font-medium'>
                                        {lead.assignedTo ? (
                                            <div className='flex flex-col gap-1 items-start'>
                                                <span>
                                                    {lead.assignedTo.email}
                                                </span>
                                                <RoleBadge
                                                    role={lead.assignedTo.role}
                                                />
                                            </div>
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
                                    <td className='px-6 py-4 font-semibold text-gray-900'>
                                        ₹
                                        {(
                                            lead.estimatedValue || 0
                                        ).toLocaleString('en-IN')}
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
