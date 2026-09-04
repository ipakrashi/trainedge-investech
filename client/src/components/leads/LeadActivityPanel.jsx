import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
    FiX,
    FiPhoneCall,
    FiMail,
    FiMessageCircle,
    FiFileText,
    FiMonitor,
    FiAlertCircle,
} from 'react-icons/fi'

const LeadActivityPanel = ({
    isOpen,
    onClose,
    lead,
    onActivitySuccess,
    isPendingMove,
}) => {
    const [activities, setActivities] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [type, setType] = useState('NOTE')
    const [summary, setSummary] = useState('')
    const [callOutcome, setCallOutcome] = useState('CONNECTED')

    useEffect(() => {
        if (isOpen && lead) {
            fetchActivities()
        }
    }, [isOpen, lead])

    const fetchActivities = async () => {
        try {
            setIsLoading(true)
            const response = await api.get(`/lead-activities/lead/${lead._id}`)
            setActivities(response.data.data || [])
        } catch (error) {
            console.error('Failed to fetch activities', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!summary.trim()) return

        try {
            setIsSubmitting(true)
            const payload = {
                lead: lead._id,
                type,
                summary,
                details: type === 'CALL' ? { callOutcome } : {},
            }
            await api.post('/lead-activities', payload)

            setSummary('')
            setType('NOTE')
            await fetchActivities()

            // Notify parent to confirm the stage move
            if (onActivitySuccess) {
                onActivitySuccess()
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add activity')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getActivityIcon = (actType) => {
        switch (actType) {
            case 'CALL':
                return <FiPhoneCall className='text-blue-500' />
            case 'EMAIL':
                return <FiMail className='text-green-500' />
            case 'WHATSAPP':
                return <FiMessageCircle className='text-emerald-500' />
            case 'DEMO':
                return <FiMonitor className='text-purple-500' />
            default:
                return <FiFileText className='text-gray-500' />
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 overflow-hidden'>
            <div
                className='absolute inset-0 bg-black/30 backdrop-blur-sm'
                onClick={onClose}
            />

            <div className='absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300'>
                {/* Pending Move Warning Banner */}
                {isPendingMove && (
                    <div className='bg-amber-50 text-amber-800 p-3 text-sm font-medium border-b border-amber-200 flex items-center gap-2 z-20'>
                        <FiAlertCircle className='shrink-0 text-lg text-amber-600' />
                        <p>
                            Log an interaction below to confirm the stage
                            change.{' '}
                            <span
                                className='font-bold cursor-pointer underline'
                                onClick={onClose}
                            >
                                Cancel move
                            </span>
                            .
                        </p>
                    </div>
                )}

                <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50'>
                    <div>
                        <h2 className='text-lg font-bold text-gray-900'>
                            {lead?.fullName}
                        </h2>
                        <p className='text-xs text-gray-500'>
                            Activity Timeline
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 text-2xl'
                        title={isPendingMove ? 'Cancel stage move' : 'Close'}
                    >
                        &times;
                    </button>
                </div>

                <div className='p-6 border-b border-gray-100 bg-white'>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='flex gap-2'>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white w-1/3'
                            >
                                <option value='NOTE'>Note</option>
                                <option value='CALL'>Call</option>
                                <option value='EMAIL'>Email</option>
                                <option value='WHATSAPP'>WhatsApp</option>
                                <option value='DEMO'>Demo</option>
                            </select>

                            {type === 'CALL' && (
                                <select
                                    value={callOutcome}
                                    onChange={(e) =>
                                        setCallOutcome(e.target.value)
                                    }
                                    className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white w-2/3'
                                >
                                    <option value='CONNECTED'>Connected</option>
                                    <option value='BUSY'>Busy</option>
                                    <option value='NO_ANSWER'>No Answer</option>
                                    <option value='CALLBACK_REQUESTED'>
                                        Callback Requested
                                    </option>
                                    <option value='WRONG_NUMBER'>
                                        Wrong Number
                                    </option>
                                </select>
                            )}
                        </div>

                        <textarea
                            required
                            rows='3'
                            placeholder='Enter interaction details...'
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none'
                        />

                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className='w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50'
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : isPendingMove
                                  ? 'Confirm Stage & Log Activity'
                                  : 'Log Activity'}
                        </button>
                    </form>
                </div>

                <div className='flex-1 overflow-y-auto p-6 bg-gray-50'>
                    {isLoading ? (
                        <div className='text-center text-sm text-gray-500'>
                            Loading timeline...
                        </div>
                    ) : activities.length === 0 ? (
                        <div className='text-center text-sm text-gray-500 italic'>
                            No activities recorded yet.
                        </div>
                    ) : (
                        <div className='space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent'>
                            {activities.map((activity) => (
                                <div
                                    key={activity._id}
                                    className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active'
                                >
                                    <div className='flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10'>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                                        <div className='flex justify-between items-start mb-1'>
                                            <span className='font-semibold text-gray-900 text-sm'>
                                                {activity.type}
                                                {activity.details
                                                    ?.callOutcome &&
                                                    ` - ${activity.details.callOutcome.replace('_', ' ')}`}
                                            </span>
                                            <span className='text-[10px] text-gray-400'>
                                                {new Date(
                                                    activity.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className='text-sm text-gray-600 mb-2'>
                                            {activity.summary}
                                        </p>
                                        <div className='text-[10px] text-gray-400 border-t border-gray-50 pt-2'>
                                            Logged by:{' '}
                                            {activity.performedBy?.firstName}{' '}
                                            {activity.performedBy?.lastName}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LeadActivityPanel
