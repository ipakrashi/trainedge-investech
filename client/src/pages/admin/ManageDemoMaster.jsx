// src/pages/admin/ManageDemoMaster.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiMonitor, FiPlus, FiClock } from 'react-icons/fi'

const ManageDemoMaster = () => {
    const [demos, setDemos] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationMinutes: 30,
    })

    const fetchDemos = async () => {
        try {
            setIsLoading(true)
            const { data } = await api.get('/demos/master')
            setDemos(data.data || [])
        } catch (error) {
            console.error('Failed to fetch demos', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDemos()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        try {
            setIsSubmitting(true)
            await api.post('/demos/master', formData)
            setFormData({ title: '', description: '', durationMinutes: 30 })
            fetchDemos()
        } catch (error) {
            alert(
                error.response?.data?.message || 'Failed to create demo master',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Demo Catalog Management
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Create and manage standard demo topics available for Sales
                    Reps to schedule.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Form Section */}
                <div className='lg:col-span-1'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24'>
                        <h2 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                            <FiPlus className='text-blue-600' /> Add New Demo
                        </h2>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Demo Title *
                                </label>
                                <input
                                    required
                                    type='text'
                                    placeholder='e.g., Platform Walkthrough'
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Duration (Minutes)
                                </label>
                                <input
                                    required
                                    type='number'
                                    min='15'
                                    step='15'
                                    value={formData.durationMinutes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            durationMinutes: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Internal Description
                                </label>
                                <textarea
                                    rows='3'
                                    placeholder='Outline of topics to cover...'
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none resize-none'
                                />
                            </div>
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
                            >
                                {isSubmitting
                                    ? 'Creating...'
                                    : 'Save Demo Topic'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className='lg:col-span-2'>
                    {isLoading ? (
                        <div className='text-center py-12 text-gray-500'>
                            Loading catalog...
                        </div>
                    ) : demos.length === 0 ? (
                        <div className='text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500'>
                            No demo topics created yet.
                        </div>
                    ) : (
                        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                            <table className='w-full text-left'>
                                <thead className='bg-gray-50 border-b border-gray-200'>
                                    <tr className='text-gray-900 font-bold text-xs uppercase tracking-wider'>
                                        <th className='px-6 py-4'>
                                            Demo Topic
                                        </th>
                                        <th className='px-6 py-4'>Duration</th>
                                        <th className='px-6 py-4'>Status</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {demos.map((demo) => (
                                        <tr
                                            key={demo._id}
                                            className='hover:bg-gray-50'
                                        >
                                            <td className='px-6 py-4'>
                                                <div className='font-semibold text-gray-900 flex items-center gap-2'>
                                                    <FiMonitor className='text-gray-400' />{' '}
                                                    {demo.title}
                                                </div>
                                                {demo.description && (
                                                    <div className='text-xs text-gray-500 mt-1 truncate max-w-xs'>
                                                        {demo.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className='px-6 py-4 text-gray-600 flex items-center gap-1'>
                                                <FiClock />{' '}
                                                {demo.durationMinutes} mins
                                            </td>
                                            <td className='px-6 py-4'>
                                                <span className='bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold'>
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ManageDemoMaster
