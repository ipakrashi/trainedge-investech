import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import { FiPlus, FiLayers } from 'react-icons/fi'

const ManageStatuses = () => {
    const [statuses, setStatuses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')

    // Form State
    const [label, setLabel] = useState('')
    const [name, setName] = useState('')
    const [colorClass, setColorClass] = useState('border-blue-500')
    const [bgClass, setBgClass] = useState('bg-blue-50')
    const [order, setOrder] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchStatuses = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/statuses')
            setStatuses(res.data.data || [])
            setError(null)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch statuses')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStatuses()
    }, [])

    const handleLabelChange = (e) => {
        const val = e.target.value
        setLabel(val)
        setName(val.toUpperCase().replace(/\s+/g, '_'))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!label || !name) return

        try {
            setIsSubmitting(true)
            setError(null)
            setSuccessMsg('')

            await api.post('/statuses', {
                name,
                label,
                colorClass,
                bgClass,
                order: Number(order),
            })

            setSuccessMsg('Status added successfully!')
            setLabel('')
            setName('')
            setColorClass('border-blue-500')
            setBgClass('bg-blue-50')
            setOrder(0)
            fetchStatuses()

            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Failed to add status. It might already exist.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Manage Pipeline Statuses
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Configure stages, colors, and order for the sales pipeline.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                <div className='lg:col-span-1'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                        <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                            <FiPlus className='text-blue-600' /> Add New Status
                        </h2>

                        {error && (
                            <div className='mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg'>
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className='mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg'>
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Display Label *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={label}
                                    onChange={handleLabelChange}
                                    placeholder='e.g., Qualified'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    System Name *
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
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Border Color Class
                                    </label>
                                    <input
                                        type='text'
                                        value={colorClass}
                                        onChange={(e) =>
                                            setColorClass(e.target.value)
                                        }
                                        placeholder='border-purple-500'
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        BG Color Class
                                    </label>
                                    <input
                                        type='text'
                                        value={bgClass}
                                        onChange={(e) =>
                                            setBgClass(e.target.value)
                                        }
                                        placeholder='bg-purple-50'
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Pipeline Order (0, 1, 2...)
                                </label>
                                <input
                                    type='number'
                                    required
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div
                                className='p-3 rounded-lg border my-2 flex items-center justify-center'
                                className={`${bgClass} ${colorClass} border-t-4`}
                            >
                                <span className='text-sm font-bold text-gray-700'>
                                    Preview: {label || 'Stage Name'}
                                </span>
                            </div>

                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                            >
                                {isSubmitting ? 'Saving...' : 'Save Status'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className='lg:col-span-2'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center'>
                            <h2 className='text-sm font-bold text-gray-600 uppercase tracking-wider'>
                                Active Statuses ({statuses.length})
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className='p-6 text-center text-gray-500'>
                                Loading...
                            </div>
                        ) : statuses.length === 0 ? (
                            <div className='p-6 text-center text-gray-500'>
                                No statuses found.
                            </div>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left border-collapse'>
                                    <thead>
                                        <tr className='border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider'>
                                            <th className='px-6 py-3 font-medium'>
                                                Order
                                            </th>
                                            <th className='px-6 py-3 font-medium'>
                                                Label
                                            </th>
                                            <th className='px-6 py-3 font-medium'>
                                                Name
                                            </th>
                                            <th className='px-6 py-3 font-medium'>
                                                Preview
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {statuses.map((s) => (
                                            <tr
                                                key={s._id}
                                                className='hover:bg-gray-50'
                                            >
                                                <td className='px-6 py-4 text-sm font-medium text-gray-500'>
                                                    {s.order}
                                                </td>
                                                <td className='px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2'>
                                                    <FiLayers className='text-gray-400' />{' '}
                                                    {s.label}
                                                </td>
                                                <td className='px-6 py-4 text-sm font-mono text-gray-500'>
                                                    {s.name}
                                                </td>
                                                <td className='px-6 py-4 text-sm'>
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded border-t-2 ${s.bgClass} ${s.colorClass} text-gray-700`}
                                                    >
                                                        Color Test
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
        </div>
    )
}

export default ManageStatuses
