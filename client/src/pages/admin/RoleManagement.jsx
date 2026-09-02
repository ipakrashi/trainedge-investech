import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiPlus, FiShield } from 'react-icons/fi'
import { SiSsrn } from 'react-icons/si'

const RoleManagement = () => {
    const [roles, setRoles] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', description: '' })

    const fetchRoles = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/roles')
            setRoles(res.data || [])
        } catch (err) {
            console.error('Failed to fetch roles:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/roles', formData)
            setIsModalOpen(false)
            setFormData({ name: '', description: '' })
            fetchRoles()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create role')
        }
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center mb-8'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Role Management
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Define and manage system access privileges.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm'
                    >
                        <FiPlus className='mr-2' /> Add Role
                    </button>
                </div>

                {isLoading ? (
                    <div className='text-center py-12'>Loading roles...</div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                    <th className='px-6 py-4 font-medium'>
                                        Role Name
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {roles.map((role) => (
                                    <tr
                                        key={role._id}
                                        className='hover:bg-gray-50'
                                    >
                                        <td className='px-6 py-4 font-medium text-gray-900 flex items-center gap-2'>
                                            <FiShield className='text-purple-600' />
                                            {role.name.toUpperCase()}
                                        </td>
                                        <td className='px-6 py-4 text-gray-500'>
                                            {role.description ||
                                                'No description provided'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Role Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6'>
                        <h2 className='text-xl font-bold mb-4'>
                            Add New System Role
                        </h2>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Role Name
                                </label>
                                <input
                                    required
                                    type='text'
                                    placeholder='e.g. senior_analyst'
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    placeholder='Describe permissions...'
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm'
                                    rows='3'
                                ></textarea>
                            </div>
                            <div className='flex justify-end gap-3 mt-6'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 border border-gray-300 rounded-lg text-sm'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm'
                                >
                                    Create Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RoleManagement
