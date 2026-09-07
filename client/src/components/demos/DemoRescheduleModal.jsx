// src/components/demos/DemoRescheduleModal.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiX, FiCalendar } from 'react-icons/fi'

const DemoRescheduleModal = ({
    isOpen,
    onClose,
    session,
    onSuccess,
    users,
}) => {
    const [newDate, setNewDate] = useState('')
    const [assignee, setAssignee] = useState('')
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen && session) {
            setAssignee(session.assignedTo?._id || session.assignedTo)
            setNewDate('')
            setReason('')
        }
    }, [isOpen, session])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newDate) return alert('Please select a new date and time.')
        if (!reason.trim())
            return alert('Please provide a reason for rescheduling.')

        try {
            setIsSubmitting(true)
            await api.put(`/demos/schedule/${session._id}/reschedule`, {
                // FIX: Convert local browser time to an absolute UTC string
                newDate: new Date(newDate).toISOString(),
                assignedTo: assignee,
                reason,
            })
            onSuccess()
            onClose()
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reschedule demo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen || !session) return null

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-fade-in-up'>
                <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl'>
                    <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                        <FiCalendar className='text-blue-600' /> Reschedule Demo
                    </h2>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 text-2xl'
                    >
                        <FiX />
                    </button>
                </div>

                <div className='p-6'>
                    <div className='bg-blue-50 rounded-lg p-3 mb-5 border border-blue-100 text-sm'>
                        <span className='text-blue-800 font-semibold'>
                            Current Slot:{' '}
                        </span>
                        <span className='text-blue-600'>
                            {new Date(session.scheduledDate).toLocaleString(
                                'en-IN',
                                {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                },
                            )}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1'>
                                New Date & Time *
                            </label>
                            <input
                                required
                                type='datetime-local'
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1'>
                                Assigned To *
                            </label>
                            <select
                                required
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none bg-white'
                            >
                                {users.map((u) => (
                                    <option key={u._id} value={u._id}>
                                        {u.firstName} {u.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-1'>
                                Reason for Rescheduling *
                            </label>
                            <textarea
                                required
                                rows='3'
                                placeholder='Client requested delay, rep unavailable, etc...'
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none resize-none'
                            />
                        </div>

                        <div className='flex justify-end gap-3 pt-2'>
                            <button
                                type='button'
                                onClick={onClose}
                                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
                            >
                                {isSubmitting
                                    ? 'Updating...'
                                    : 'Confirm Reschedule'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default DemoRescheduleModal
