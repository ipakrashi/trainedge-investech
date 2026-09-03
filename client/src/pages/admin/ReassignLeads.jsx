import { useState, useEffect } from 'react'
import { FiSearch, FiRefreshCcw } from 'react-icons/fi'
import api from '../../api/axios'

const ReassignLeads = () => {
    const [leads, setLeads] = useState([])
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isReassigning, setIsReassigning] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [leadsRes, usersRes] = await Promise.all([
                api.get('/leads'),
                api.get('/users'),
            ])

            setLeads(leadsRes.data?.data || [])

            const fetchedUsers = usersRes.data?.data || usersRes.data
            setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : [])
        } catch (err) {
            setError('Failed to fetch leads and users.')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleReassign = async (leadId, newAssigneeId) => {
        if (!newAssigneeId) return

        try {
            setIsReassigning(leadId)
            await api.put(`/leads/${leadId}`, { assignedTo: newAssigneeId })

            const targetUser = users.find((u) => u._id === newAssigneeId)
            setLeads((prevLeads) =>
                prevLeads.map((lead) => {
                    if (lead._id === leadId) {
                        return { ...lead, assignedTo: targetUser }
                    }
                    return lead
                }),
            )
        } catch (err) {
            alert('Failed to reassign lead. Please try again.')
            console.error(err)
        } finally {
            setIsReassigning(null)
        }
    }

    const filteredLeads = leads.filter((lead) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            lead.fullName?.toLowerCase().includes(q) ||
            lead.email?.toLowerCase().includes(q) ||
            lead.phone?.includes(q)
        )
    })

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        )
    }

    return (
        // Locks to exact screen height, kills outer scroll, establishes Flexbox column layout
        <div className='bg-gray-50 h-[calc(100vh-32px)] overflow-hidden flex flex-col py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col min-h-0'>
                {/* Header shrink-0 wrapper */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                            <FiRefreshCcw /> Reassign Leads
                        </h1>
                        <p className='text-sm text-gray-500 mt-1'>
                            Transfer ownership of existing leads to different
                            team members.
                        </p>
                    </div>

                    <div className='relative w-full md:w-64'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <FiSearch className='text-gray-400' />
                        </div>
                        <input
                            type='text'
                            placeholder='Search leads by name, email...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm'
                        />
                    </div>
                </div>

                {error && (
                    <div className='text-red-600 bg-red-50 p-4 rounded-lg mb-6 shrink-0'>
                        {error}
                    </div>
                )}

                {/* Table Container automatically expands to fill the remaining space perfectly */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden mb-4'>
                    <div className='overflow-auto flex-1'>
                        <table className='w-full text-left border-collapse'>
                            <thead className='sticky top-0 z-10 bg-gray-50 shadow-sm'>
                                <tr className='text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                    <th className='px-6 py-4 font-medium'>
                                        Lead ID / Name
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Contact Info
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Status
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Current Owner
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Reassign To
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead) => {
                                        const currentOwnerId =
                                            lead.assignedTo?._id ||
                                            lead.assignedTo

                                        return (
                                            <tr
                                                key={lead._id}
                                                className='hover:bg-gray-50 transition-colors'
                                            >
                                                <td className='px-6 py-4'>
                                                    <div className='font-medium text-gray-900'>
                                                        {lead.fullName}
                                                    </div>
                                                    <div className='text-gray-400 text-xs font-mono mt-0.5'>
                                                        {lead._id
                                                            .slice(-6)
                                                            .toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <div className='text-gray-700'>
                                                        {lead.email || 'N/A'}
                                                    </div>
                                                    <div className='text-gray-500 text-xs mt-0.5'>
                                                        {lead.phone}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <span className='px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-700'>
                                                        {lead.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                </td>
                                                <td className='px-6 py-4 text-gray-700 font-medium'>
                                                    {lead.assignedTo?.email ||
                                                        lead.assignedTo
                                                            ?.firstName ||
                                                        'Unassigned'}
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <select
                                                        disabled={
                                                            isReassigning ===
                                                            lead._id
                                                        }
                                                        onChange={(e) =>
                                                            handleReassign(
                                                                lead._id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`w-full max-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white ${isReassigning === lead._id ? 'opacity-50 cursor-wait' : ''}`}
                                                        defaultValue=''
                                                    >
                                                        <option
                                                            value=''
                                                            disabled
                                                        >
                                                            {isReassigning ===
                                                            lead._id
                                                                ? 'Saving...'
                                                                : 'Select new owner...'}
                                                        </option>
                                                        {users
                                                            .filter(
                                                                (u) =>
                                                                    u._id !==
                                                                    currentOwnerId,
                                                            )
                                                            .map((user) => (
                                                                <option
                                                                    key={
                                                                        user._id
                                                                    }
                                                                    value={
                                                                        user._id
                                                                    }
                                                                >
                                                                    {
                                                                        user.firstName
                                                                    }{' '}
                                                                    {
                                                                        user.lastName
                                                                    }{' '}
                                                                    (
                                                                    {user.role
                                                                        ?.name ||
                                                                        user.role}
                                                                    )
                                                                </option>
                                                            ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan='5'
                                            className='px-6 py-12 text-center text-gray-500'
                                        >
                                            No leads found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReassignLeads
