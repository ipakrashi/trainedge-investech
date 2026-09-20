// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
    FiEdit2,
    FiTrash2,
    FiPlus,
    FiUser,
    FiMail,
    FiShield,
    FiX,
    FiLock,
} from 'react-icons/fi'
import RoleBadge from '../../components/common/RoleBadge'

const UserManagement = () => {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [availableRoles, setAvailableRoles] = useState([])

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
    })

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/users')
            const fetchedUsers = res.data?.data || res.data
            setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : [])
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMetaData = async () => {
        try {
            setIsLoading(true)
            const [usersResult, rolesResult] = await Promise.allSettled([
                api.get('/users'),
                api.get('/roles'),
            ])

            if (usersResult.status === 'fulfilled') {
                const fetchedUsers =
                    usersResult.value.data?.data || usersResult.value.data
                setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : [])
            }

            if (rolesResult.status === 'fulfilled') {
                const fetchedRoles =
                    rolesResult.value.data?.data || rolesResult.value.data
                setAvailableRoles(
                    Array.isArray(fetchedRoles) ? fetchedRoles : [],
                )
            }
        } catch (err) {
            console.error('Failed to load admin data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMetaData()
    }, [])

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user)
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                password: '',
                role: user.role?._id || user.role || '',
            })
        } else {
            setEditingUser(null)
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: availableRoles[0]?._id || '',
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editingUser) {
                const payload = { ...formData }
                if (!payload.password) delete payload.password
                await api.put(`/users/${editingUser._id}`, payload)
            } else {
                await api.post('/users', formData)
            }
            setIsModalOpen(false)
            fetchUsers()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save user.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (
            window.confirm(
                'Are you sure you want to delete this staff member? This cannot be undone.',
            )
        ) {
            try {
                await api.delete(`/users/${id}`)
                fetchUsers()
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user.')
            }
        }
    }

    const hasUsers = users && users.length > 0

    return (
        <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header Banner */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8'>
                    <div>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                            Staff Management
                        </h1>
                        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                            Manage system access credentials, role permissions,
                            and staff accounts.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className='bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto'
                    >
                        <FiPlus className='mr-2' /> Add Staff Member
                    </button>
                </div>

                {isLoading ? (
                    <div className='flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3'></div>
                        <span className='text-sm text-gray-500 font-medium'>
                            Loading staff directory...
                        </span>
                    </div>
                ) : !hasUsers ? (
                    <div className='text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
                        <FiUser className='mx-auto h-12 w-12 text-gray-300 mb-3' />
                        <h3 className='text-base font-semibold text-gray-900'>
                            No staff accounts found
                        </h3>
                        <p className='text-sm text-gray-500 mt-1'>
                            Add your first team member using the button above.
                        </p>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        {/* Section Header */}
                        <div className='px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between'>
                            <h3 className='font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2'>
                                <FiShield className='text-blue-600' /> Active
                                Staff Members
                            </h3>
                            <span className='text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full'>
                                {users.length}{' '}
                                {users.length === 1 ? 'Member' : 'Members'}
                            </span>
                        </div>

                        {/* 1. MOBILE CARD VIEW (< md screens) */}
                        <div className='block md:hidden divide-y divide-gray-100'>
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                                >
                                    {/* Top Row: User Name & Role Badge */}
                                    <div className='flex items-start justify-between gap-2'>
                                        <div>
                                            <div className='font-bold text-gray-900 text-sm sm:text-base'>
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className='text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate'>
                                                <FiMail className='text-gray-400 flex-shrink-0' />
                                                <span className='truncate'>
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flex-shrink-0'>
                                            <RoleBadge role={user.role} />
                                        </div>
                                    </div>

                                    {/* Bottom Row: Action Buttons */}
                                    <div className='flex items-center justify-end gap-2 pt-1 border-t border-gray-100'>
                                        <button
                                            onClick={() =>
                                                handleOpenModal(user)
                                            }
                                            className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
                                        >
                                            <FiEdit2 size={13} /> Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(user._id)
                                            }
                                            className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
                                        >
                                            <FiTrash2 size={13} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
                        <div className='hidden md:block overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='bg-gray-50 text-gray-900 font-bold text-xs uppercase tracking-wider border-b border-gray-100'>
                                        <th className='px-6 py-4'>Name</th>
                                        <th className='px-6 py-4'>Email</th>
                                        <th className='px-6 py-4'>Role</th>
                                        <th className='px-6 py-4 text-right'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className='hover:bg-gray-50 transition-colors'
                                        >
                                            <td className='px-6 py-4 font-semibold text-gray-900'>
                                                <div className='flex items-center gap-2'>
                                                    <div className='w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold'>
                                                        {user.firstName?.[0]?.toUpperCase()}
                                                        {user.lastName?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span>
                                                        {user.firstName}{' '}
                                                        {user.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-gray-600'>
                                                {user.email}
                                            </td>
                                            <td className='px-6 py-4'>
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className='px-6 py-4 text-right space-x-2'>
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(user)
                                                    }
                                                    className='text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors'
                                                    title='Edit Staff Member'
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(user._id)
                                                    }
                                                    className='text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors'
                                                    title='Delete Staff Member'
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT STAFF MODAL */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]'>
                        {/* Modal Header */}
                        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0'>
                            <h2 className='text-lg font-bold text-gray-900'>
                                {editingUser
                                    ? 'Edit Staff Member'
                                    : 'Onboard New Staff'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form
                            onSubmit={handleSubmit}
                            className='p-6 space-y-4 overflow-y-auto flex-1'
                        >
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        First Name *
                                    </label>
                                    <input
                                        required
                                        type='text'
                                        placeholder='John'
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                firstName: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        Last Name *
                                    </label>
                                    <input
                                        required
                                        type='text'
                                        placeholder='Doe'
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                lastName: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Email Address *
                                </label>
                                <div className='relative'>
                                    <FiMail className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                                    <input
                                        required
                                        type='email'
                                        placeholder='john.doe@company.com'
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg pl-10 pr-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    {editingUser
                                        ? 'New Password (leave blank to keep current)'
                                        : 'Password *'}
                                </label>
                                <div className='relative'>
                                    <FiLock className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                                    <input
                                        type='password'
                                        required={!editingUser}
                                        placeholder={
                                            editingUser
                                                ? '••••••••'
                                                : 'Enter temporary password'
                                        }
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg pl-10 pr-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    System Role *
                                </label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            role: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none'
                                >
                                    <option value='' disabled>
                                        Select Assigned Role
                                    </option>
                                    {availableRoles.map((roleObj) => (
                                        <option
                                            key={roleObj._id}
                                            value={roleObj._id}
                                        >
                                            {roleObj.name.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Modal Actions */}
                            <div className='flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm'
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingUser
                                          ? 'Save Changes'
                                          : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserManagement
