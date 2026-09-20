// src/pages/admin/ReassignLeads.jsx
import { useState, useEffect, useMemo } from 'react'
import {
    FiSearch,
    FiRefreshCcw,
    FiUser,
    FiMail,
    FiPhone,
    FiLoader,
    FiCheck,
} from 'react-icons/fi'
import api from '../../api/axios'
import RoleBadge from '../../components/common/RoleBadge'
import StatusBadge from '../../components/common/StatusBadge'

const ReassignLeads = () => {
    const [leads, setLeads] = useState([])
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isReassigning, setIsReassigning] = useState(null)
    const [justUpdatedId, setJustUpdatedId] = useState(null)
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
            setError(null)
        } catch (err) {
            setError('Failed to fetch leads and team members.')
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
                prevLeads.map((lead) =>
                    lead._id === leadId
                        ? { ...lead, assignedTo: targetUser }
                        : lead,
                ),
            )

            setJustUpdatedId(leadId)
            setTimeout(() => setJustUpdatedId(null), 2500)
        } catch (err) {
            alert('Failed to reassign lead. Please try again.')
            console.error(err)
        } finally {
            setIsReassigning(null)
        }
    }

    const filteredLeads = useMemo(() => {
        if (!searchQuery.trim()) return leads
        const q = searchQuery.toLowerCase()
        return leads.filter((lead) => {
            return (
                lead.fullName?.toLowerCase().includes(q) ||
                lead.email?.toLowerCase().includes(q) ||
                lead.phone?.includes(q) ||
                lead._id?.toLowerCase().includes(q)
            )
        })
    }, [leads, searchQuery])

    const renderAssigneeSelect = (lead, currentOwnerId) => (
        <div className='relative w-full'>
            <select
                disabled={isReassigning === lead._id}
                value=''
                onChange={(e) => handleReassign(lead._id, e.target.value)}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none transition-all ${
                    isReassigning === lead._id
                        ? 'opacity-50 cursor-wait bg-gray-50'
                        : justUpdatedId === lead._id
                          ? 'border-green-400 ring-1 ring-green-400 bg-green-50/30'
                          : ''
                }`}
            >
                <option value='' disabled>
                    {isReassigning === lead._id
                        ? 'Transferring ownership...'
                        : justUpdatedId === lead._id
                          ? 'Transferred successfully!'
                          : 'Select new owner...'}
                </option>
                {users
                    .filter((u) => u._id !== currentOwnerId)
                    .map((user) => (
                        <option key={user._id} value={user._id}>
                            {user.firstName} {user.lastName} (
                            {user.role?.name || user.role || 'Staff'})
                        </option>
                    ))}
            </select>
            {isReassigning === lead._id && (
                <FiLoader className='absolute right-8 top-1/2 -translate-y-1/2 animate-spin text-blue-600 text-xs sm:text-sm pointer-events-none' />
            )}
            {justUpdatedId === lead._id && (
                <FiCheck className='absolute right-8 top-1/2 -translate-y-1/2 text-green-600 text-xs sm:text-sm pointer-events-none' />
            )}
        </div>
    )

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gray-50'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3'></div>
                <span className='text-sm text-gray-500 font-medium'>
                    Loading leads and team assignments...
                </span>
            </div>
        )
    }

    const hasLeads = filteredLeads.length > 0

    return (
        <div className='bg-gray-50 h-[calc(100vh-32px)] overflow-hidden flex flex-col py-4 sm:py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col min-h-0'>
                {/* Header Toolbar */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 sm:mb-6 shrink-0'>
                    <div>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2'>
                            <FiRefreshCcw className='text-blue-600' /> Reassign
                            Leads
                        </h1>
                        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                            Transfer prospective lead ownership and pipelines
                            across team counselors.
                        </p>
                    </div>

                    <div className='relative w-full md:w-72'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <FiSearch className='text-gray-400' />
                        </div>
                        <input
                            type='text'
                            placeholder='Search leads by name, email, phone...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none bg-white'
                        />
                    </div>
                </div>

                {error && (
                    <div className='text-red-700 bg-red-50 border border-red-200 text-xs sm:text-sm p-3.5 rounded-lg mb-4 shrink-0'>
                        {error}
                    </div>
                )}

                {/* Main Content Area */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden mb-2'>
                    {/* 1. MOBILE CARD VIEW (< md screens) */}
                    <div className='block md:hidden overflow-y-auto flex-1 divide-y divide-gray-100'>
                        {hasLeads ? (
                            filteredLeads.map((lead) => {
                                const currentOwnerId =
                                    lead.assignedTo?._id || lead.assignedTo
                                const isUpdated = justUpdatedId === lead._id

                                return (
                                    <div
                                        key={lead._id}
                                        className={`p-4 space-y-3 transition-colors ${
                                            isUpdated
                                                ? 'bg-green-50/40'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        {/* Top Row: Lead Identity & Status */}
                                        <div className='flex items-start justify-between gap-2'>
                                            <div>
                                                <div className='font-bold text-gray-900 text-sm sm:text-base'>
                                                    {lead.fullName}
                                                </div>
                                                <span className='font-mono text-[11px] text-gray-400'>
                                                    ID:{' '}
                                                    {lead._id
                                                        .slice(-6)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div className='flex-shrink-0'>
                                                <StatusBadge
                                                    status={lead.status}
                                                />
                                            </div>
                                        </div>

                                        {/* Contact Strip */}
                                        <div className='bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs space-y-1 text-gray-600'>
                                            <div className='flex items-center gap-1.5 truncate'>
                                                <FiMail className='text-gray-400 flex-shrink-0' />
                                                <span className='truncate'>
                                                    {lead.email || 'N/A'}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1.5'>
                                                <FiPhone className='text-gray-400 flex-shrink-0' />
                                                <span>
                                                    {lead.phone || 'No phone'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Current Owner Details */}
                                        <div className='text-xs flex items-center justify-between gap-2 pt-1'>
                                            <span className='text-[11px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1'>
                                                <FiUser /> Current Owner:
                                            </span>
                                            <div className='flex items-center gap-1.5 flex-wrap justify-end'>
                                                <span className='font-medium text-gray-800'>
                                                    {lead.assignedTo?.firstName
                                                        ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName || ''}`
                                                        : lead.assignedTo
                                                              ?.email ||
                                                          'Unassigned'}
                                                </span>
                                                {lead.assignedTo?.role && (
                                                    <RoleBadge
                                                        role={
                                                            lead.assignedTo.role
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Reassignment Dropdown */}
                                        <div className='pt-1'>
                                            <label className='block text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-1'>
                                                Transfer Ownership To:
                                            </label>
                                            {renderAssigneeSelect(
                                                lead,
                                                currentOwnerId,
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className='p-8 text-center text-xs sm:text-sm text-gray-400'>
                                No leads found matching your search.
                            </div>
                        )}
                    </div>

                    {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
                    <div className='hidden md:block overflow-auto flex-1'>
                        <table className='w-full text-left border-collapse'>
                            <thead className='sticky top-0 z-10 bg-gray-50 shadow-sm'>
                                <tr className='text-gray-900 font-bold text-xs uppercase tracking-wider border-b border-gray-100'>
                                    <th className='px-6 py-4'>Lead Details</th>
                                    <th className='px-6 py-4'>Contact Info</th>
                                    <th className='px-6 py-4'>Status</th>
                                    <th className='px-6 py-4'>Current Owner</th>
                                    <th className='px-6 py-4 w-64'>
                                        Reassign To
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {hasLeads ? (
                                    filteredLeads.map((lead) => {
                                        const currentOwnerId =
                                            lead.assignedTo?._id ||
                                            lead.assignedTo
                                        const isUpdated =
                                            justUpdatedId === lead._id

                                        return (
                                            <tr
                                                key={lead._id}
                                                className={`transition-colors ${
                                                    isUpdated
                                                        ? 'bg-green-50/50'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <td className='px-6 py-4'>
                                                    <div className='font-semibold text-gray-900'>
                                                        {lead.fullName}
                                                    </div>
                                                    <div className='text-gray-400 text-xs font-mono mt-0.5'>
                                                        ID:{' '}
                                                        {lead._id
                                                            .slice(-6)
                                                            .toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4 text-gray-600'>
                                                    <div className='truncate max-w-[200px]'>
                                                        {lead.email || 'N/A'}
                                                    </div>
                                                    <div className='text-gray-400 text-xs mt-0.5'>
                                                        {lead.phone || '-'}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <StatusBadge
                                                        status={lead.status}
                                                    />
                                                </td>
                                                <td className='px-6 py-4 text-gray-700'>
                                                    <div className='flex items-center gap-1.5 flex-wrap'>
                                                        <span className='font-medium text-gray-900'>
                                                            {lead.assignedTo
                                                                ?.firstName
                                                                ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName || ''}`
                                                                : lead
                                                                      .assignedTo
                                                                      ?.email ||
                                                                  'Unassigned'}
                                                        </span>
                                                        {lead.assignedTo
                                                            ?.role && (
                                                            <RoleBadge
                                                                role={
                                                                    lead
                                                                        .assignedTo
                                                                        .role
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    {renderAssigneeSelect(
                                                        lead,
                                                        currentOwnerId,
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan='5'
                                            className='px-6 py-12 text-center text-gray-400 text-sm'
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
