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
            const res = await api.get('/payment-modes')
            setModes(res.data?.data || [])
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        setSuccess('')

        try {
            await api.post('/payment-modes', formData)
            setSuccess('Payment mode created successfully.')
            setFormData({ name: '', label: '' })
            fetchModes()
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to create payment mode.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        )
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='mb-8'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Manage Payment Modes
                    </h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Configure dynamic payment methods available during fee
                        collection.
                    </p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Create Form */}
                    <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit'>
                        <h3 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            <FiPlus className='text-blue-600' /> Add Payment
                            Mode
                        </h3>

                        {error && (
                            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg'>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className='mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg'>
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    System Key Name (e.g. upi)
                                </label>
                                <input
                                    type='text'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder='e.g. net_banking'
                                    required
                                    className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Display Label (e.g. Net Banking)
                                </label>
                                <input
                                    type='text'
                                    name='label'
                                    value={formData.label}
                                    onChange={handleChange}
                                    placeholder='e.g. Net Banking'
                                    required
                                    className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500'
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

                    {/* Table List */}
                    <div className='lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='px-6 py-4 border-b border-gray-100'>
                            <h3 className='font-bold text-gray-900'>
                                Active Payment Modes
                            </h3>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                        <th className='px-6 py-4 font-medium'>
                                            Display Label
                                        </th>
                                        <th className='px-6 py-4 font-medium'>
                                            Key Name
                                        </th>
                                        <th className='px-6 py-4 font-medium'>
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {modes.map((m) => (
                                        <tr
                                            key={m._id}
                                            className='hover:bg-gray-50'
                                        >
                                            <td className='px-6 py-4 font-semibold text-gray-900 flex items-center gap-2'>
                                                <FiCreditCard className='text-blue-500' />{' '}
                                                {m.label}
                                            </td>
                                            <td className='px-6 py-4 font-mono text-gray-500 text-xs'>
                                                {m.name}
                                            </td>
                                            <td className='px-6 py-4'>
                                                <span className='inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700'>
                                                    <FiCheckCircle /> Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {modes.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan='3'
                                                className='px-6 py-12 text-center text-gray-400'
                                            >
                                                No payment modes configured yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManagePaymentModes
