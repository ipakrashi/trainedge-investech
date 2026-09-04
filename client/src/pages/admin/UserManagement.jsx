import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiEdit2, FiTrash2, FiPlus, FiShield } from 'react-icons/fi'

const UserManagement = () => {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
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
                email: user.email,
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
                role: '',
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingUser) {
                const payload = { ...formData }
                if (!payload.password) delete payload.password
                await api.put(`/users/${editingUser._id}`, payload)
            } else {
                // FIXED: Removed /addNew to match backend REST architecture
                await api.post('/users', formData)
            }
            setIsModalOpen(false)
            fetchUsers()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save user')
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
                alert('Failed to delete user.')
            }
        }
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center mb-8'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Staff Management
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Manage system access, roles, and onboard new team
                            members.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm'
                    >
                        <FiPlus className='mr-2' /> Add Staff
                    </button>
                </div>

                {isLoading ? (
                    <div className='text-center py-12'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                        <th className='px-6 py-4 font-medium'>
                                            Name
                                        </th>
                                        <th className='px-6 py-4 font-medium'>
                                            Email
                                        </th>
                                        <th className='px-6 py-4 font-medium'>
                                            Role
                                        </th>
                                        <th className='px-6 py-4 text-right font-medium'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {users.map((user) => {
                                        const roleName =
                                            user.role?.name ||
                                            user.role ||
                                            'N/A'
                                        const isAdmin =
                                            roleName.toLowerCase() === 'admin'
                                        return (
                                            <tr
                                                key={user._id}
                                                className='hover:bg-gray-50 transition-colors'
                                            >
                                                <td className='px-6 py-4 font-medium text-gray-900'>
                                                    {user.firstName}{' '}
                                                    {user.lastName}
                                                </td>
                                                <td className='px-6 py-4 text-gray-500'>
                                                    {user.email}
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center w-fit gap-1
                                                        ${isAdmin ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
                                                    `}
                                                    >
                                                        {isAdmin && (
                                                            <FiShield className='text-[10px]' />
                                                        )}
                                                        {roleName.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className='px-6 py-4 text-right space-x-3'>
                                                    <button
                                                        onClick={() =>
                                                            handleOpenModal(
                                                                user,
                                                            )
                                                        }
                                                        className='text-gray-400 hover:text-blue-600 transition-colors'
                                                        title='Edit User'
                                                    >
                                                        <FiEdit2 className='text-lg inline' />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                user._id,
                                                            )
                                                        }
                                                        className='text-gray-400 hover:text-red-600 transition-colors'
                                                        title='Delete User'
                                                    >
                                                        <FiTrash2 className='text-lg inline' />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden'>
                        <div className='px-6 py-4 border-b border-gray-100 bg-gray-50'>
                            <h2 className='text-xl font-bold text-gray-800'>
                                {editingUser
                                    ? 'Edit Staff Member'
                                    : 'Add New Staff'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        First Name
                                    </label>
                                    <input
                                        required
                                        type='text'
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                firstName: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Last Name
                                    </label>
                                    <input
                                        required
                                        type='text'
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                lastName: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Email Address
                                </label>
                                <input
                                    required
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    {editingUser
                                        ? 'New Password (leave blank to keep current)'
                                        : 'Temporary Password'}
                                </label>
                                <input
                                    type='password'
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    System Role
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
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500'
                                >
                                    <option value=''>Select Role</option>
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

                            <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
                                >
                                    {editingUser
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
