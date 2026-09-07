// src/pages/demos/DemoCalendar.jsx
import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import LeadActivityPanel from '../../components/leads/LeadActivityPanel'
import {
    FiCalendar,
    FiClock,
    FiUser,
    FiMonitor,
    FiPhone,
    FiFilter,
} from 'react-icons/fi'

const DemoCalendar = () => {
    const [demos, setDemos] = useState([])
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Auth & Roles
    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null
    const roleName = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()
    const isAdmin = roleName === 'admin'

    // Filters
    const [statusFilter, setStatusFilter] = useState('SCHEDULED')
    const [startDate, setStartDate] = useState('') // Replaced static dropdown
    const [endDate, setEndDate] = useState('') // Replaced static dropdown
    const [assigneeFilter, setAssigneeFilter] = useState('All')

    // Interaction State
    const [activeLead, setActiveLead] = useState(null)

    const fetchDemos = useCallback(async () => {
        try {
            setIsLoading(true)

            // Build Query Params dynamically
            let url = `/demos/sessions?status=${statusFilter}`

            if (startDate) {
                url += `&startDate=${startDate}`
            }
            if (endDate) {
                url += `&endDate=${endDate}`
            }
            if (isAdmin && assigneeFilter !== 'All') {
                url += `&assignedTo=${assigneeFilter}`
            }

            const { data } = await api.get(url)
            setDemos(data.data || [])

            // Fetch users for admin filter dropdown
            if (isAdmin && users.length === 0) {
                const usersRes = await api.get('/users')
                setUsers(usersRes.data.data || usersRes.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch demos', error)
        } finally {
            setIsLoading(false)
        }
    }, [
        statusFilter,
        startDate,
        endDate,
        assigneeFilter,
        isAdmin,
        users.length,
    ])

    useEffect(() => {
        fetchDemos()
    }, [fetchDemos])

    const handlePanelClose = () => {
        setActiveLead(null)
        fetchDemos() // Refresh calendar to reflect completions/updates
    }

    const handleClearFilters = () => {
        setStatusFilter('All')
        setStartDate('')
        setEndDate('')
        setAssigneeFilter('All')
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-64px)]'>
            <div className='mb-6 shrink-0'>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Demo Calendar
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Track scheduled meetings, platform walkthroughs, and past
                    completions. Click any card to open the lead activity
                    timeline.
                </p>
            </div>

            {/* Dynamic Filter Band */}
            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-5 items-center mb-6 shrink-0'>
                <div className='flex items-center gap-2 text-gray-500 font-medium text-sm'>
                    <FiFilter /> Filters:
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-blue-500 outline-none bg-white'
                >
                    <option value='SCHEDULED'>Upcoming / Scheduled</option>
                    <option value='COMPLETED'>Completed</option>
                    <option value='CANCELLED'>Cancelled</option>
                    <option value='All'>All Statuses</option>
                </select>

                <div className='flex items-center gap-2'>
                    <label className='text-xs font-medium text-gray-500'>
                        From:
                    </label>
                    <input
                        type='date'
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-blue-500 outline-none text-gray-700 bg-white'
                    />
                </div>

                <div className='flex items-center gap-2'>
                    <label className='text-xs font-medium text-gray-500'>
                        To:
                    </label>
                    <input
                        type='date'
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-blue-500 outline-none text-gray-700 bg-white'
                    />
                </div>

                {isAdmin && (
                    <div className='flex items-center gap-2 md:ml-auto'>
                        <select
                            value={assigneeFilter}
                            onChange={(e) => setAssigneeFilter(e.target.value)}
                            className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-blue-500 outline-none bg-white'
                        >
                            <option value='All'>All Sales Reps</option>
                            {users.map((u) => (
                                <option key={u._id} value={u._id}>
                                    {u.firstName} {u.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Clear Filters Button */}
                <button
                    onClick={handleClearFilters}
                    className={`text-sm font-medium transition-colors ${
                        statusFilter !== 'SCHEDULED' ||
                        startDate ||
                        endDate ||
                        assigneeFilter !== 'All'
                            ? 'text-blue-600 hover:text-blue-800 underline cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                    } ${!isAdmin && 'md:ml-auto'}`}
                    disabled={
                        statusFilter === 'SCHEDULED' &&
                        !startDate &&
                        !endDate &&
                        assigneeFilter === 'All'
                    }
                >
                    Clear Filters
                </button>
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto pb-8'>
                {isLoading ? (
                    <div className='flex items-center justify-center h-full'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    </div>
                ) : demos.length === 0 ? (
                    <div className='bg-white rounded-xl shadow-sm border border-dashed border-gray-300 py-16 text-center h-full flex flex-col items-center justify-center'>
                        <FiCalendar className='mx-auto h-12 w-12 text-gray-300 mb-3' />
                        <h3 className='text-sm font-medium text-gray-900'>
                            No demos found
                        </h3>
                        <p className='text-sm text-gray-500 mt-1'>
                            Try adjusting your filters to see more results.
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4'>
                        {demos.map((demo) => {
                            const dateObj = new Date(demo.scheduledDate)
                            const isCompleted = demo.status === 'COMPLETED'
                            const isCancelled = demo.status === 'CANCELLED'

                            return (
                                <div
                                    key={demo._id}
                                    onClick={() => setActiveLead(demo.lead)}
                                    className={`bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                                        isCompleted || isCancelled
                                            ? 'border-gray-200 hover:border-gray-400 opacity-80'
                                            : 'border-gray-200 hover:border-purple-300'
                                    }`}
                                >
                                    <div
                                        className={`${isCompleted || isCancelled ? 'bg-gray-50 border-gray-200' : 'bg-purple-50 border-purple-100'} px-5 py-4 border-b flex justify-between items-start`}
                                    >
                                        <div>
                                            <div
                                                className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCompleted || isCancelled ? 'text-gray-500' : 'text-purple-600'}`}
                                            >
                                                {dateObj.toLocaleDateString(
                                                    'en-IN',
                                                    {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                )}
                                            </div>
                                            <div className='text-lg font-black text-gray-900 flex items-center gap-2'>
                                                <FiClock
                                                    className={
                                                        isCompleted ||
                                                        isCancelled
                                                            ? 'text-gray-400'
                                                            : 'text-purple-500'
                                                    }
                                                />
                                                {dateObj.toLocaleTimeString(
                                                    'en-IN',
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex flex-col items-end gap-1'>
                                            <span
                                                className={`${isCompleted || isCancelled ? 'bg-gray-200 text-gray-700' : 'bg-purple-100 text-purple-700'} text-xs font-bold px-2.5 py-1 rounded-md`}
                                            >
                                                {
                                                    demo.demoMaster
                                                        ?.durationMinutes
                                                }{' '}
                                                mins
                                            </span>
                                            {isCompleted && (
                                                <span className='text-[10px] font-bold text-green-600 uppercase tracking-wider'>
                                                    Completed
                                                </span>
                                            )}
                                            {isCancelled && (
                                                <span className='text-[10px] font-bold text-red-600 uppercase tracking-wider'>
                                                    Cancelled
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className='p-5 space-y-4'>
                                        <div>
                                            <div className='text-xs text-gray-500 mb-1 flex items-center gap-1'>
                                                <FiUser /> Lead Name
                                            </div>
                                            <div className='font-semibold text-gray-900'>
                                                {demo.lead?.fullName ||
                                                    'Unknown Lead'}
                                            </div>
                                            <div className='text-sm text-gray-500 flex items-center gap-1 mt-0.5'>
                                                <FiPhone className='text-xs' />{' '}
                                                {demo.lead?.phone || 'No phone'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-xs text-gray-500 mb-1 flex items-center gap-1'>
                                                <FiMonitor /> Demo Topic
                                            </div>
                                            <div className='font-medium text-gray-800 text-sm'>
                                                {demo.demoMaster?.title ||
                                                    'Custom Walkthrough'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs'>
                                        <span className='text-gray-500'>
                                            Assigned to:
                                        </span>
                                        <span className='font-semibold text-gray-700'>
                                            {demo.assignedTo?.firstName}{' '}
                                            {demo.assignedTo?.lastName}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <LeadActivityPanel
                isOpen={!!activeLead}
                lead={activeLead}
                onClose={handlePanelClose}
            />
        </div>
    )
}

export default DemoCalendar
