import { FiClock, FiPhoneCall } from 'react-icons/fi'

const FollowUpList = ({ tasks }) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <FiClock className='text-orange-500' /> Priority Follow-Ups
            </h3>
            <div className='space-y-3'>
                {tasks?.map((task) => (
                    <div
                        key={task._id}
                        className='p-3 bg-orange-50/50 border border-orange-100 rounded-lg flex justify-between items-center'
                    >
                        <div>
                            <h4 className='font-semibold text-sm text-gray-800'>
                                {task.fullName}
                            </h4>
                            <p className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
                                <FiPhoneCall className='text-gray-400' />{' '}
                                {task.phone}
                            </p>
                        </div>
                        <span className='text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded'>
                            {new Date(task.nextFollowUpDate).toLocaleDateString(
                                'en-IN',
                                { month: 'short', day: 'numeric' },
                            )}
                        </span>
                    </div>
                ))}
                {(!tasks || tasks.length === 0) && (
                    <p className='text-sm text-gray-400 text-center py-6'>
                        No pending follow-ups for today.
                    </p>
                )}
            </div>
        </div>
    )
}

export default FollowUpList
