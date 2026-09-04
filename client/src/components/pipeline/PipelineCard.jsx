import { FiClock, FiPhone } from 'react-icons/fi'

const PipelineCard = ({ lead, onDragStart, onClick }) => {
    const isDraggable = lead.status !== 'LOST'

    return (
        <div
            draggable={isDraggable}
            onDragStart={
                isDraggable ? (e) => onDragStart(e, lead._id) : undefined
            }
            onClick={() => onClick(lead)}
            className={`bg-white p-4 rounded-lg shadow-sm border transition-all ${
                isDraggable
                    ? 'border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md'
                    : 'border-red-100 cursor-pointer opacity-75 grayscale-[0.2]'
            }`}
        >
            <div className='flex justify-between items-start mb-2'>
                <h4
                    className={`font-semibold text-sm truncate pr-2 ${isDraggable ? 'text-gray-900' : 'text-gray-600 line-through'}`}
                >
                    {lead.fullName}
                </h4>
                <span className='text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100'>
                    ₹{lead.estimatedValue || 0}
                </span>
            </div>

            <div className='text-xs text-gray-500 mb-3 truncate'>
                {lead.interestedCourses && lead.interestedCourses.length > 0
                    ? lead.interestedCourses
                          .map((c) => c.courseTitle)
                          .join(', ')
                    : 'No course specified'}
            </div>

            {!isDraggable && lead.lostReason && (
                <div className='text-[10px] text-red-600 bg-red-50 p-1.5 rounded mb-2 font-medium truncate'>
                    {lead.lostReason}
                </div>
            )}

            <div className='flex justify-between items-center text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-50'>
                <div className='flex items-center gap-1 truncate'>
                    <FiPhone className='shrink-0' />
                    <span className='truncate'>{lead.phone}</span>
                </div>

                {lead.nextFollowUpDate && (
                    <div className='flex items-center gap-1 text-orange-500 shrink-0 ml-2 bg-orange-50 px-1.5 py-0.5 rounded'>
                        <FiClock />
                        <span>
                            {new Date(lead.nextFollowUpDate).toLocaleDateString(
                                'en-IN',
                                { month: 'short', day: 'numeric' },
                            )}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PipelineCard
