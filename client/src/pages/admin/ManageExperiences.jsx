// src/pages/admin/ManageExperiences.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import { FiPlus, FiTrendingUp, FiHash, FiCheckCircle } from 'react-icons/fi'

const ManageExperiences = () => {
    const [experiences, setExperiences] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')

    // Form State
    const [label, setLabel] = useState('')
    const [name, setName] = useState('')
    const [order, setOrder] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchExperiences = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/experiences')
            const fetchedList = res.data.data || []
            // Sort by order ascending for consistent presentation
            setExperiences(
                [...fetchedList].sort(
                    (a, b) => (a.order ?? 0) - (b.order ?? 0),
                ),
            )
            setError(null)
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to fetch experiences',
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchExperiences()
    }, [])

    const handleLabelChange = (e) => {
        const val = e.target.value
        setLabel(val)
        setName(val.toUpperCase().replace(/\s+/g, '_'))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!label.trim() || !name.trim()) return

        try {
            setIsSubmitting(true)
            setError(null)
            setSuccessMsg('')

            await api.post('/experiences', {
                name: name.trim(),
                label: label.trim(),
                order: Number(order),
            })

            setSuccessMsg('Experience level added successfully!')
            setLabel('')
            setName('')
            setOrder(0)
            fetchExperiences()

            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Failed to add experience level.',
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
                    Manage Experience Levels
                </h1>
                <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                    Configure trading experience classifications and dropdown
                    ordering for leads.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start'>
                {/* 1. Form Section */}
                <div className='lg:col-span-1 lg:sticky lg:top-24'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6'>
                        <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3'>
                            <FiPlus className='text-blue-600' /> Add New Level
                        </h2>

                        {error && (
                            <div className='mb-4 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-lg border border-red-100'>
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className='mb-4 p-3 bg-green-50 text-green-700 text-xs sm:text-sm rounded-lg border border-green-100 flex items-center gap-1.5'>
                                <FiCheckCircle className='flex-shrink-0' />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Display Label *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={label}
                                    onChange={handleLabelChange}
                                    placeholder='e.g., Advanced Trader'
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    System Name (Auto) *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                                .toUpperCase()
                                                .replace(/\s+/g, '_'),
                                        )
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-gray-50 font-mono text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Dropdown Order (0, 1, 2...) *
                                </label>
                                <input
                                    type='number'
                                    required
                                    min='0'
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                />
                            </div>

                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm'
                            >
                                {isSubmitting ? 'Saving...' : 'Save Experience'}
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
                                Loading experience levels...
                            </span>
                        </div>
                    ) : experiences.length === 0 ? (
                        <div className='text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
                            <FiTrendingUp className='mx-auto h-12 w-12 text-gray-300 mb-3' />
                            <h3 className='text-base font-semibold text-gray-900'>
                                No experience levels found
                            </h3>
                            <p className='text-sm text-gray-500 mt-1'>
                                Add your first level classification using the
                                form on the left.
                            </p>
                        </div>
                    ) : (
                        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                            {/* Catalog Header Bar */}
                            <div className='px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between'>
                                <h3 className='font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2'>
                                    <FiTrendingUp className='text-blue-600' />{' '}
                                    Active Levels
                                </h3>
                                <span className='text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full'>
                                    {experiences.length}{' '}
                                    {experiences.length === 1
                                        ? 'Level'
                                        : 'Levels'}
                                </span>
                            </div>

                            {/* Mobile Card View (< md screens) */}
                            <div className='block md:hidden divide-y divide-gray-100'>
                                {experiences.map((exp) => (
                                    <div
                                        key={exp._id}
                                        className='p-4 space-y-2 hover:bg-gray-50 transition-colors'
                                    >
                                        <div className='flex items-center justify-between gap-2'>
                                            <div className='font-semibold text-gray-900 text-sm flex items-center gap-2'>
                                                <FiTrendingUp className='text-gray-400 text-sm' />
                                                <span>{exp.label}</span>
                                            </div>
                                            <span className='inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold'>
                                                <FiHash className='text-[10px] text-gray-400' />{' '}
                                                Order {exp.order ?? 0}
                                            </span>
                                        </div>

                                        <div className='pt-1'>
                                            <span className='text-[11px] font-mono text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded'>
                                                {exp.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Tabular View (>= md screens) */}
                            <div className='hidden md:block overflow-x-auto'>
                                <table className='w-full text-left border-collapse'>
                                    <thead>
                                        <tr className='text-gray-900 font-bold text-xs uppercase tracking-wider border-b border-gray-100 bg-white'>
                                            <th className='px-6 py-4 w-24'>
                                                Order
                                            </th>
                                            <th className='px-6 py-4'>
                                                Display Label
                                            </th>
                                            <th className='px-6 py-4'>
                                                System Key
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100 text-sm'>
                                        {experiences.map((exp) => (
                                            <tr
                                                key={exp._id}
                                                className='hover:bg-gray-50 transition-colors'
                                            >
                                                <td className='px-6 py-4 text-sm font-semibold text-gray-500'>
                                                    <span className='inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs'>
                                                        #{exp.order ?? 0}
                                                    </span>
                                                </td>
                                                <td className='px-6 py-4 font-semibold text-gray-900'>
                                                    <div className='flex items-center gap-2'>
                                                        <FiTrendingUp className='text-gray-400' />
                                                        <span>{exp.label}</span>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <span className='font-mono text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded'>
                                                        {exp.name}
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

export default ManageExperiences
