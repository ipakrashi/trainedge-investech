import { FiPhoneCall } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const FollowUpList = ({ tasks }) => (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='px-6 py-5 border-b border-gray-100'>
            <h3 className='font-bold text-gray-900'>
                Action Required (Follow-ups)
            </h3>
        </div>
        <div className='p-4 space-y-3'>
            {tasks.map((task) => (
                <div
                    key={task._id}
                    className='flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100'
                >
                    {/* UPDATED: Changed div to an anchor tag with the tel: protocol */}
                    <a
                        href={`tel:${task.phone}`}
                        className='bg-blue-50 p-2 rounded-full text-blue-600 mr-4 shrink-0 hover:bg-blue-100 hover:scale-105 transition-all cursor-pointer'
                        title={`Call ${task.phone}`}
                    >
                        <FiPhoneCall />
                    </a>

                    <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-semibold text-gray-900 truncate'>
                            {task.fullName}
                        </h4>
                        <p className='text-xs text-gray-500 truncate'>
                            Current Status: {task.status}
                        </p>
                    </div>
                    <div className='flex flex-col items-end shrink-0'>
                        <span className='text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded mb-1'>
                            {new Date(
                                task.nextFollowUpDate,
                            ).toLocaleDateString()}
                        </span>
                        <Link
                            to='/leads'
                            className='text-[10px] text-blue-600 hover:underline'
                        >
                            View Lead
                        </Link>
                    </div>
                </div>
            ))}
            {tasks.length === 0 && (
                <div className='text-center text-gray-500 py-4 text-sm'>
                    You're all caught up! No pending follow-ups.
                </div>
            )}
        </div>
    </div>
)

export default FollowUpList
