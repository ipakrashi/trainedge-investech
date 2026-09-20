// src/pages/admin/ManagePaymentModes.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiCreditCard, FiPlus, FiCheckCircle } from 'react-icons/fi'

const ManagePaymentModes = () => {
    const [modes, setModes] = useState([])
    const [formData, setFormData] = useState({ name: '', label: '' })
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const fetchModes = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/payment-modes')
            setModes(res.data?.data || [])
            setError('')
        } catch (err) {
            console.error('Failed to fetch payment modes:', err)
            setError('Failed to load payment modes.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchModes()
    }, [])

    const handleLabelChange = (e) => {
        const val = e.target.value
        setFormData((prev) => {
            const autoKey = prev.label
                ? prev.label.toLowerCase().replace(/\s+/g, '_')
                : ''
            const shouldUpdateKey = prev.name === '' || prev.name === autoKey

            return {
                ...prev,
                label: val,
                name: shouldUpdateKey
                    ? val.toLowerCase().replace(/\s+/g, '_')
                    : prev.name,
            }
        })
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name.trim() || !formData.label.trim()) return

        setIsSubmitting(true)
        setError('')
        setSuccess('')

        try {
            await api.post('/payment-modes', {
                name: formData.name.trim().toLowerCase(),
                label: formData.label.trim(),
            })
            setSuccess('Payment mode created successfully.')
            setFormData({ name: '', label: '' })
            fetchModes()

            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to create payment mode.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header Banner */}
                <div className='mb-6 sm:mb-8'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                        Manage Payment Modes
                    </h1>
                    <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                        Configure dynamic payment methods available during
                        student fee collection.
                    </p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start'>
                    {/* 1. Form Section */}
                    <div className='lg:col-span-1 lg:sticky lg:top-24'>
                        <div className='bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100'>
                            <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3'>
                                <FiPlus className='text-blue-600' /> Add Payment
                                Mode
                            </h2>

                            {error && (
                                <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg'>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className='mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs sm:text-sm rounded-lg flex items-center gap-1.5'>
                                    <FiCheckCircle className='flex-shrink-0' />
                                    <span>{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className='space-y-4'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        Display Label *
                                    </label>
                                    <input
                                        type='text'
                                        name='label'
                                        value={formData.label}
                                        onChange={handleLabelChange}
                                        placeholder='e.g. Net Banking'
                                        required
                                        className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        System Key Name *
                                    </label>
                                    <input
                                        type='text'
                                        name='name'
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder='e.g. net_banking'
                                        required
                                        className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-gray-50 font-mono text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    />
                                </div>

                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50'
                                >
                                    {isSubmitting
                                        ? 'Creating...'
                                        : 'Save Payment Mode'}
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
                                    Loading payment modes...
                                </span>
                            </div>
                        ) : (
                            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                                {/* Section Header */}
                                <div className='px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between'>
                                    <h3 className='font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2'>
                                        <FiCreditCard className='text-blue-600' />{' '}
                                        Active Payment Modes
                                    </h3>
                                    <span className='text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full'>
                                        {modes.length}{' '}
                                        {modes.length === 1 ? 'Mode' : 'Modes'}
                                    </span>
                                </div>

                                {/* Mobile Card View (< md screens) */}
                                <div className='block md:hidden divide-y divide-gray-100'>
                                    {modes.length > 0 ? (
                                        modes.map((m) => (
                                            <div
                                                key={m._id}
                                                className='p-4 space-y-2 hover:bg-gray-50 transition-colors'
                                            >
                                                <div className='flex items-center justify-between gap-2'>
                                                    <div className='font-semibold text-gray-900 text-sm flex items-center gap-2'>
                                                        <FiCreditCard className='text-blue-500 flex-shrink-0' />
                                                        <span>{m.label}</span>
                                                    </div>
                                                    <span className='inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex-shrink-0'>
                                                        <FiCheckCircle className='text-xs' />{' '}
                                                        Active
                                                    </span>
                                                </div>

                                                <div className='pt-1'>
                                                    <span className='text-[11px] font-mono text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded'>
                                                        {m.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='p-8 text-center text-xs text-gray-400'>
                                            No payment modes configured yet.
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Tabular View (>= md screens) */}
                                <div className='hidden md:block overflow-x-auto'>
                                    <table className='w-full text-left border-collapse'>
                                        <thead>
                                            <tr className='bg-white text-gray-900 font-bold text-xs uppercase tracking-wider border-b border-gray-100'>
                                                <th className='px-6 py-4'>
                                                    Display Label
                                                </th>
                                                <th className='px-6 py-4'>
                                                    System Key
                                                </th>
                                                <th className='px-6 py-4 text-center'>
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100 text-sm'>
                                            {modes.length > 0 ? (
                                                modes.map((m) => (
                                                    <tr
                                                        key={m._id}
                                                        className='hover:bg-gray-50 transition-colors'
                                                    >
                                                        <td className='px-6 py-4 font-semibold text-gray-900'>
                                                            <div className='flex items-center gap-2'>
                                                                <FiCreditCard className='text-blue-500 flex-shrink-0' />
                                                                <span>
                                                                    {m.label}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className='px-6 py-4'>
                                                            <span className='font-mono text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded'>
                                                                {m.name}
                                                            </span>
                                                        </td>
                                                        <td className='px-6 py-4 text-center'>
                                                            <span className='inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200'>
                                                                <FiCheckCircle className='text-xs' />{' '}
                                                                Active
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan='3'
                                                        className='px-6 py-12 text-center text-gray-400 text-sm'
                                                    >
                                                        No payment modes
                                                        configured yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManagePaymentModes
