// src/pages/admin/ManageDemoMaster.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiMonitor, FiPlus, FiClock, FiCheckCircle } from 'react-icons/fi'

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
            await api.post('/demos/master', {
                ...formData,
                durationMinutes: Number(formData.durationMinutes),
            })
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
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
            {/* Header Banner */}
            <div className='mb-6 sm:mb-8'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                    Demo Catalog Management
                </h1>
                <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                    Create and maintain standard demo master blueprints
                    available for sales representatives to schedule.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start'>
                {/* 1. Form Section */}
                <div className='lg:col-span-1 lg:sticky lg:top-24'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6'>
                        <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3'>
                            <FiPlus className='text-blue-600' /> Add Demo
                            Blueprint
                        </h2>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Demo Title *
                                </label>
                                <input
                                    required
                                    type='text'
                                    placeholder='e.g., Platform Walkthrough & Strategy'
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Duration (Minutes) *
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
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Internal Description / Outline
                                </label>
                                <textarea
                                    rows='3'
                                    placeholder='Key agenda points, syllabus preview, and pitch notes...'
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none'
                                />
                            </div>

                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm text-sm'
                            >
                                {isSubmitting
                                    ? 'Creating...'
                                    : 'Save Demo Topic'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. List Section */}
                <div className='lg:col-span-2'>
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3'></div>
                            <span className='text-sm text-gray-500 font-medium'>
                                Loading demo catalog...
                            </span>
                        </div>
                    ) : demos.length === 0 ? (
                        <div className='text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
                            <FiMonitor className='mx-auto h-12 w-12 text-gray-300 mb-3' />
                            <h3 className='text-base font-semibold text-gray-900'>
                                No demo topics created yet
                            </h3>
                            <p className='text-sm text-gray-500 mt-1'>
                                Create your first demo blueprint using the form
                                on the left.
                            </p>
                        </div>
                    ) : (
                        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                            {/* Catalog Header Bar */}
                            <div className='px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between'>
                                <h3 className='font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2'>
                                    <FiMonitor className='text-blue-600' />{' '}
                                    Available Topics
                                </h3>
                                <span className='text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full'>
                                    {demos.length}{' '}
                                    {demos.length === 1 ? 'Topic' : 'Topics'}
                                </span>
                            </div>

                            {/* 1. MOBILE CARD VIEW (< md screens) */}
                            <div className='block md:hidden divide-y divide-gray-100'>
                                {demos.map((demo) => (
                                    <div
                                        key={demo._id}
                                        className='p-4 space-y-2.5 hover:bg-gray-50 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-2'>
                                            <div className='font-semibold text-gray-900 text-sm'>
                                                {demo.title}
                                            </div>
                                            <span className='inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0'>
                                                <FiCheckCircle className='text-xs' />{' '}
                                                Active
                                            </span>
                                        </div>

                                        {demo.description && (
                                            <p className='text-xs text-gray-600 leading-relaxed line-clamp-2'>
                                                {demo.description}
                                            </p>
                                        )}

                                        <div className='flex items-center text-xs text-gray-500 pt-1'>
                                            <span className='inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 text-gray-700 font-medium'>
                                                <FiClock className='text-gray-400' />{' '}
                                                {demo.durationMinutes} mins
                                                duration
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
                            <div className='hidden md:block overflow-x-auto'>
                                <table className='w-full text-left border-collapse'>
                                    <thead>
                                        <tr className='text-gray-900 font-bold text-xs uppercase tracking-wider border-b border-gray-100 bg-white'>
                                            <th className='px-6 py-4'>
                                                Demo Topic
                                            </th>
                                            <th className='px-6 py-4'>
                                                Duration
                                            </th>
                                            <th className='px-6 py-4 text-center'>
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100 text-sm'>
                                        {demos.map((demo) => (
                                            <tr
                                                key={demo._id}
                                                className='hover:bg-gray-50 transition-colors'
                                            >
                                                <td className='px-6 py-4'>
                                                    <div className='font-semibold text-gray-900'>
                                                        {demo.title}
                                                    </div>
                                                    {demo.description && (
                                                        <div className='text-xs text-gray-500 mt-1 max-w-md line-clamp-1'>
                                                            {demo.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className='px-6 py-4 text-gray-600'>
                                                    <div className='inline-flex items-center gap-1.5'>
                                                        <FiClock className='text-gray-400' />
                                                        <span>
                                                            {
                                                                demo.durationMinutes
                                                            }{' '}
                                                            mins
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4 text-center'>
                                                    <span className='inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold'>
                                                        <FiCheckCircle className='text-xs' />{' '}
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ManageDemoMaster
