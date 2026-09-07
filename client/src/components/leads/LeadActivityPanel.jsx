// src/components/leads/LeadActivityPanel.jsx
import { useState, useEffect } from 'react'
import RoleBadge from '../common/RoleBadge'
import api from '../../api/axios'
import DemoFeedbackModal from '../demos/DemoFeedbackModal'
import {
    FiX,
    FiPhoneCall,
    FiMail,
    FiMessageCircle,
    FiFileText,
    FiMonitor,
    FiAlertCircle,
    FiCalendar,
    FiCheckCircle,
    FiStar,
} from 'react-icons/fi'

const LeadActivityPanel = ({
    isOpen,
    onClose,
    lead,
    onActivitySuccess,
    isPendingMove,
}) => {
    const [activities, setActivities] = useState([])
    const [demoMasters, setDemoMasters] = useState([])
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Main Form State
    const [type, setType] = useState('NOTE')
    const [summary, setSummary] = useState('')
    const [callOutcome, setCallOutcome] = useState('CONNECTED')
    const [nextFollowUpDate, setNextFollowUpDate] = useState('')

    // Demo Scheduling State
    const [demoMasterId, setDemoMasterId] = useState('')
    const [demoDate, setDemoDate] = useState('')
    const [demoAssignee, setDemoAssignee] = useState('')

    // Feedback Modal State
    const [feedbackSession, setFeedbackSession] = useState(null)

    useEffect(() => {
        if (isOpen && lead) {
            fetchActivities()
            fetchDropdownData()
            setNextFollowUpDate(
                lead.nextFollowUpDate
                    ? lead.nextFollowUpDate.split('T')[0]
                    : '',
            )
            setType('NOTE')
            setSummary('')
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

    const fetchDropdownData = async () => {
        try {
            const [demoRes, usersRes] = await Promise.all([
                api.get('/demos/master'),
                api.get('/users'),
            ])
            const dms = demoRes.data.data || []
            setDemoMasters(dms)
            if (dms.length > 0) setDemoMasterId(dms[0]._id)

            setUsers(usersRes.data.data || usersRes.data || [])
            const userInfo = JSON.parse(localStorage.getItem('userInfo'))
            if (userInfo) setDemoAssignee(userInfo._id)
        } catch (error) {
            console.error('Failed to fetch dropdown data', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!summary.trim() && type !== 'DEMO') return

        try {
            setIsSubmitting(true)

            if (type === 'DEMO') {
                if (!demoMasterId || !demoDate || !demoAssignee) {
                    alert('Please complete all demo scheduling fields.')
                    setIsSubmitting(false)
                    return
                }

                await api.post('/demos/schedule', {
                    leadId: lead._id,
                    demoMasterId,
                    assignedTo: demoAssignee,
                    scheduledDate: demoDate,
                    summary: summary || 'Demo Scheduled',
                    nextFollowUpDate: nextFollowUpDate || undefined,
                })
            } else {
                const payload = {
                    lead: lead._id,
                    type,
                    summary,
                    details: type === 'CALL' ? { callOutcome } : {},
                    nextFollowUpDate: nextFollowUpDate || undefined,
                }
                await api.post('/lead-activities', payload)
            }

            setSummary('')
            setType('NOTE')
            setDemoDate('')
            await fetchActivities()

            if (onActivitySuccess) onActivitySuccess()
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add activity')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFeedbackSuccess = () => {
        fetchActivities()
        if (onActivitySuccess) onActivitySuccess() // Trigger parent refresh to update lead status
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
                            Activity Timeline & Follow-Up
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 text-2xl'
                    >
                        &times;
                    </button>
                </div>

                <div className='p-6 border-b border-gray-100 bg-white shadow-sm z-10 relative'>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='flex gap-2'>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white w-1/3 outline-none'
                            >
                                <option value='NOTE'>Note</option>
                                <option value='CALL'>Call</option>
                                <option value='EMAIL'>Email</option>
                                <option value='WHATSAPP'>WhatsApp</option>
                                <option value='DEMO'>Schedule Demo</option>
                            </select>

                            {type === 'CALL' && (
                                <select
                                    value={callOutcome}
                                    onChange={(e) =>
                                        setCallOutcome(e.target.value)
                                    }
                                    className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white w-2/3 outline-none'
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

                        {type === 'DEMO' && (
                            <div className='grid grid-cols-1 gap-3 bg-purple-50 p-4 rounded-lg border border-purple-100 animate-fade-in-up'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                        Select Demo Topic
                                    </label>
                                    <select
                                        required
                                        value={demoMasterId}
                                        onChange={(e) =>
                                            setDemoMasterId(e.target.value)
                                        }
                                        className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 outline-none bg-white'
                                    >
                                        {demoMasters.map((d) => (
                                            <option key={d._id} value={d._id}>
                                                {d.title} ({d.durationMinutes}m)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                            Date & Time
                                        </label>
                                        <input
                                            required
                                            type='datetime-local'
                                            value={demoDate}
                                            onChange={(e) =>
                                                setDemoDate(e.target.value)
                                            }
                                            className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 outline-none'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                            Assign To
                                        </label>
                                        <select
                                            required
                                            value={demoAssignee}
                                            onChange={(e) =>
                                                setDemoAssignee(e.target.value)
                                            }
                                            className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 outline-none bg-white'
                                        >
                                            {users.map((u) => (
                                                <option
                                                    key={u._id}
                                                    value={u._id}
                                                >
                                                    {u.firstName} {u.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <textarea
                            required={type !== 'DEMO'}
                            rows='3'
                            placeholder={
                                type === 'DEMO'
                                    ? 'Enter meeting links or pre-demo notes (Optional)...'
                                    : 'Enter interaction details...'
                            }
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none outline-none'
                        />

                        <div>
                            <label className='block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1'>
                                <FiCalendar className='text-blue-500' /> Next
                                Follow-Up Date (Optional)
                            </label>
                            <input
                                type='date'
                                value={nextFollowUpDate}
                                onChange={(e) =>
                                    setNextFollowUpDate(e.target.value)
                                }
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none'
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className='w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors'
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : isPendingMove
                                  ? 'Confirm Stage & Log'
                                  : type === 'DEMO'
                                    ? 'Schedule Demo'
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
                            {activities.map((activity) => {
                                const session = activity.details?.demoSessionId

                                return (
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

                                            {/* POST-DEMO FEEDBACK UI (Trigger) */}
                                            {activity.type === 'DEMO' &&
                                                session && (
                                                    <div className='bg-purple-50 rounded-md p-3 mb-2 border border-purple-100'>
                                                        <div className='text-xs text-purple-900 font-semibold mb-1'>
                                                            {session.demoMaster
                                                                ?.title ||
                                                                'Custom Demo'}
                                                        </div>
                                                        <div className='text-[10px] text-purple-700 flex justify-between'>
                                                            <span>
                                                                With:{' '}
                                                                {
                                                                    session
                                                                        .assignedTo
                                                                        ?.firstName
                                                                }
                                                            </span>
                                                            <span>
                                                                {new Date(
                                                                    session.scheduledDate,
                                                                ).toLocaleString(
                                                                    'en-IN',
                                                                    {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>

                                                        {session.status ===
                                                        'COMPLETED' ? (
                                                            <div className='mt-2 pt-2 border-t border-purple-200'>
                                                                <div className='flex items-center gap-1 text-amber-500 mb-1'>
                                                                    {[
                                                                        ...Array(
                                                                            5,
                                                                        ),
                                                                    ].map(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) => (
                                                                            <FiStar
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className={
                                                                                    i <
                                                                                    session.rating
                                                                                        ? 'fill-current text-amber-500'
                                                                                        : 'text-gray-300'
                                                                                }
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                                <p className='text-xs text-gray-600 italic'>
                                                                    "
                                                                    {
                                                                        session.clientComments
                                                                    }
                                                                    "
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type='button'
                                                                onClick={() =>
                                                                    setFeedbackSession(
                                                                        session,
                                                                    )
                                                                }
                                                                className='mt-2 text-xs bg-white border border-purple-300 text-purple-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-100 hover:border-purple-400 flex items-center gap-1 shadow-sm transition-all'
                                                            >
                                                                <FiCheckCircle />{' '}
                                                                Mark Completed &
                                                                Provide Feedback
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                            <div className='text-[10px] text-gray-400 border-t border-gray-50 pt-2 flex items-center gap-2'>
                                                <span>
                                                    Logged by:{' '}
                                                    {
                                                        activity.performedBy
                                                            ?.firstName
                                                    }{' '}
                                                    {
                                                        activity.performedBy
                                                            ?.lastName
                                                    }
                                                </span>
                                                <RoleBadge
                                                    role={
                                                        activity.performedBy
                                                            ?.role
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Mount Dedicated Feedback Modal Here */}
            <DemoFeedbackModal
                isOpen={!!feedbackSession}
                session={feedbackSession}
                onClose={() => setFeedbackSession(null)}
                onSuccess={handleFeedbackSuccess}
            />
        </div>
    )
}

export default LeadActivityPanel
