// src/components/leads/LeadActivityPanel.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import DemoFeedbackModal from '../demos/DemoFeedbackModal'
import DemoRescheduleModal from '../demos/DemoRescheduleModal'
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
    FiChevronDown,
    FiChevronUp,
    FiRefreshCw,
} from 'react-icons/fi'

const LeadActivityPanel = ({
    isOpen,
    onClose,
    lead,
    onActivitySuccess,
    isPendingMove,
    targetStatus, // NEW: Accepts the target stage from Kanban Drag
}) => {
    const [activities, setActivities] = useState([])
    const [demoMasters, setDemoMasters] = useState([])
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(true)

    // Form States
    const [type, setType] = useState('NOTE')
    const [leadStatus, setLeadStatus] = useState('') // NEW: Editable lead status
    const [summary, setSummary] = useState('')
    const [callOutcome, setCallOutcome] = useState('CONNECTED')
    const [nextFollowUpDate, setNextFollowUpDate] = useState('')
    const [demoMasterId, setDemoMasterId] = useState('')
    const [demoDate, setDemoDate] = useState('')
    const [demoAssignee, setDemoAssignee] = useState('')

    const [feedbackSession, setFeedbackSession] = useState(null)
    const [rescheduleSession, setRescheduleSession] = useState(null)

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
            // Pre-select Kanban targetStatus, or default to current status
            setLeadStatus(targetStatus || lead.status || 'NEW')
        }
    }, [isOpen, lead, targetStatus])

    const fetchActivities = async () => {
        try {
            setIsLoading(true)
            const response = await api.get(`/lead-activities/lead/${lead._id}`)
            const acts = response.data.data || []
            setActivities(acts)

            if (acts.length > 0 && !isPendingMove) {
                setIsFormOpen(false)
            } else {
                setIsFormOpen(true)
            }
        } catch (error) {
            console.error('Failed to fetch activities', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchDropdownData = async () => {
        try {
            const [demoRes, usersRes] = await Promise.allSettled([
                api.get('/demos/master'),
                api.get('/users'),
            ])

            if (demoRes.status === 'fulfilled') {
                const dms = demoRes.value.data.data || []
                setDemoMasters(dms)
                if (dms.length > 0) setDemoMasterId(dms[0]._id)
            }

            let usersList = []
            if (usersRes.status === 'fulfilled') {
                const allUsers =
                    usersRes.value.data.data || usersRes.value.data || []
                const eligibleDemoRoles = ['admin', 'sales', 'faculty']
                usersList = allUsers.filter((u) => {
                    const roleName = (
                        u.role?.name ||
                        u.role ||
                        ''
                    ).toLowerCase()
                    return eligibleDemoRoles.includes(roleName)
                })
            }

            const userInfoString = localStorage.getItem('userInfo')
            const userInfo = userInfoString ? JSON.parse(userInfoString) : null

            if (usersList.length === 0 && userInfo) {
                const myRole = (
                    userInfo.role?.name ||
                    userInfo.role ||
                    ''
                ).toLowerCase()
                if (['admin', 'sales', 'faculty'].includes(myRole)) {
                    usersList = [userInfo]
                }
            }

            setUsers(usersList)
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

            // 1. Execute Status Change if dropdown was modified OR if dragged in Kanban
            if (leadStatus && leadStatus !== lead.status) {
                await api.put(`/leads/${lead._id}`, { status: leadStatus })
            }

            // 2. Log the activity / Schedule Demo
            if (type === 'DEMO') {
                if (!demoMasterId || !demoDate || !demoAssignee)
                    return alert('Please complete all fields.')
                await api.post('/demos/schedule', {
                    leadId: lead._id,
                    demoMasterId,
                    assignedTo: demoAssignee,
                    scheduledDate: new Date(demoDate).toISOString(),
                    summary: summary || 'Demo Scheduled',
                    nextFollowUpDate: nextFollowUpDate || undefined,
                })
            } else {
                await api.post('/lead-activities', {
                    lead: lead._id,
                    type,
                    summary,
                    details: type === 'CALL' ? { callOutcome } : {},
                    nextFollowUpDate: nextFollowUpDate || undefined,
                })
            }

            setSummary('')
            setType('NOTE')
            setDemoDate('')
            setIsFormOpen(false)
            await fetchActivities()
            if (onActivitySuccess) onActivitySuccess()
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add activity')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleActionSuccess = () => {
        fetchActivities()
        if (onActivitySuccess) onActivitySuccess()
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
                <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 z-20 shrink-0'>
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

                {isPendingMove && (
                    <div className='bg-amber-50 text-amber-800 p-3 text-sm font-medium border-b border-amber-200 flex items-center gap-2 shrink-0'>
                        <FiAlertCircle className='shrink-0 text-lg text-amber-600' />
                        <p>
                            Log an interaction to confirm stage change.{' '}
                            <span
                                className='font-bold cursor-pointer underline'
                                onClick={onClose}
                            >
                                Cancel
                            </span>
                            .
                        </p>
                    </div>
                )}

                <div
                    className={`bg-white shadow-sm z-10 shrink-0 transition-all duration-300 ${isFormOpen ? 'border-b border-gray-200' : ''}`}
                >
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className='w-full px-6 py-3 flex justify-between items-center text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors'
                    >
                        <span>
                            {isFormOpen
                                ? 'Cancel Interaction'
                                : '+ Log New Interaction or Demo'}
                        </span>
                        {isFormOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>

                    {isFormOpen && (
                        <div className='px-6 pb-5 pt-2 animate-fade-in-up'>
                            <form onSubmit={handleSubmit} className='space-y-4'>
                                {/* NEW: Dual Select for Activity Type AND Status */}
                                <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                            Activity Type
                                        </label>
                                        <select
                                            value={type}
                                            onChange={(e) =>
                                                setType(e.target.value)
                                            }
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none'
                                        >
                                            <option value='NOTE'>Note</option>
                                            <option value='CALL'>Call</option>
                                            <option value='EMAIL'>Email</option>
                                            <option value='WHATSAPP'>
                                                WhatsApp
                                            </option>
                                            <option value='DEMO'>
                                                Schedule Demo
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                            Current Stage
                                        </label>
                                        <select
                                            value={leadStatus}
                                            onChange={(e) =>
                                                setLeadStatus(e.target.value)
                                            }
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-blue-500 outline-none bg-white'
                                        >
                                            <option value='NEW'>New</option>
                                            <option value='CONTACTED'>
                                                Contacted
                                            </option>
                                            <option value='INTERESTED'>
                                                Interested
                                            </option>
                                            <option value='DEMO_SCHEDULED'>
                                                Demo Scheduled
                                            </option>
                                            <option value='DEMO_ATTENDED'>
                                                Demo Attended
                                            </option>
                                            <option value='QUALIFIED'>
                                                Qualified
                                            </option>
                                            <option value='ENROLLED'>
                                                Enrolled
                                            </option>
                                            <option value='LOST'>Lost</option>
                                            <option value='JUNK'>Junk</option>
                                        </select>
                                    </div>
                                </div>

                                {type === 'CALL' && (
                                    <div>
                                        <select
                                            value={callOutcome}
                                            onChange={(e) =>
                                                setCallOutcome(e.target.value)
                                            }
                                            className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 w-full outline-none'
                                        >
                                            <option value='CONNECTED'>
                                                Connected
                                            </option>
                                            <option value='BUSY'>Busy</option>
                                            <option value='NO_ANSWER'>
                                                No Answer
                                            </option>
                                        </select>
                                    </div>
                                )}

                                {type === 'DEMO' && (
                                    <div className='grid gap-3 bg-purple-50 p-4 rounded-lg border border-purple-100'>
                                        <div>
                                            <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                                Topic
                                            </label>
                                            <select
                                                required
                                                value={demoMasterId}
                                                onChange={(e) =>
                                                    setDemoMasterId(
                                                        e.target.value,
                                                    )
                                                }
                                                className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none bg-white'
                                            >
                                                {demoMasters.map((d) => (
                                                    <option
                                                        key={d._id}
                                                        value={d._id}
                                                    >
                                                        {d.title} (
                                                        {d.durationMinutes}m)
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
                                                        setDemoDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none'
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
                                                        setDemoAssignee(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className='w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none bg-white'
                                                >
                                                    {users.map((u) => (
                                                        <option
                                                            key={u._id}
                                                            value={u._id}
                                                        >
                                                            {u.firstName}{' '}
                                                            {u.lastName}
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
                                            ? 'Enter pre-demo notes (Optional)...'
                                            : 'Enter interaction details...'
                                    }
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 resize-none outline-none'
                                />

                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1'>
                                        <FiCalendar className='text-blue-500' />{' '}
                                        Next Follow-Up (Optional)
                                    </label>
                                    <input
                                        type='date'
                                        value={nextFollowUpDate}
                                        onChange={(e) =>
                                            setNextFollowUpDate(e.target.value)
                                        }
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none'
                                    />
                                </div>

                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors'
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : type === 'DEMO'
                                          ? 'Schedule Demo'
                                          : 'Save & Update Lead'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className='flex-1 overflow-y-auto px-4 py-6 bg-gray-50 min-h-0'>
                    {isLoading ? (
                        <div className='text-center text-sm text-gray-500 mt-10'>
                            Loading timeline...
                        </div>
                    ) : activities.length === 0 ? (
                        <div className='text-center text-sm text-gray-500 italic mt-10'>
                            No activities recorded yet.
                        </div>
                    ) : (
                        <div className='space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent'>
                            {activities.map((activity) => {
                                const session = activity.details?.demoSessionId
                                return (
                                    <div
                                        key={activity._id}
                                        className='relative flex items-start gap-2.5'
                                    >
                                        <div className='flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm shrink-0 z-10'>
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className='flex-1 bg-white p-3.5 rounded-xl shadow-sm border border-gray-100'>
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
                                            <p className='text-sm text-gray-600 mb-2 whitespace-pre-wrap'>
                                                {activity.summary}
                                            </p>

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
                                                        ) : session.status ===
                                                          'SCHEDULED' ? (
                                                            <div className='mt-3 grid grid-cols-2 gap-2 border-t border-purple-200 pt-3'>
                                                                <button
                                                                    type='button'
                                                                    onClick={() =>
                                                                        setFeedbackSession(
                                                                            session,
                                                                        )
                                                                    }
                                                                    className='w-full text-[11px] bg-white border border-purple-300 text-purple-700 py-1.5 rounded-lg font-bold hover:bg-purple-100 flex items-center justify-center gap-1 shadow-sm transition-all'
                                                                >
                                                                    <FiCheckCircle />{' '}
                                                                    Mark
                                                                    Completed
                                                                </button>
                                                                <button
                                                                    type='button'
                                                                    onClick={() =>
                                                                        setRescheduleSession(
                                                                            session,
                                                                        )
                                                                    }
                                                                    className='w-full text-[11px] bg-white border border-gray-300 text-gray-700 py-1.5 rounded-lg font-bold hover:bg-gray-100 flex items-center justify-center gap-1 shadow-sm transition-all'
                                                                >
                                                                    <FiRefreshCw />{' '}
                                                                    Reschedule
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className='mt-2 text-xs font-bold text-red-600'>
                                                                Cancelled
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            <div className='text-[10px] text-gray-400 border-t border-gray-50 pt-2 flex items-center gap-2 mt-2'>
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
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            <DemoFeedbackModal
                isOpen={!!feedbackSession}
                session={feedbackSession}
                onClose={() => setFeedbackSession(null)}
                onSuccess={handleActionSuccess}
            />
            <DemoRescheduleModal
                isOpen={!!rescheduleSession}
                session={rescheduleSession}
                onClose={() => setRescheduleSession(null)}
                onSuccess={handleActionSuccess}
                users={users}
            />
        </div>
    )
}

export default LeadActivityPanel
