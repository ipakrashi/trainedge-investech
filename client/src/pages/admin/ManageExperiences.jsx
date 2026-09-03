import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import { FiPlus, FiTrendingUp } from 'react-icons/fi'

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
            setExperiences(res.data.data || [])
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
        if (!label || !name) return

        try {
            setIsSubmitting(true)
            setError(null)
            setSuccessMsg('')

            await api.post('/experiences', {
                name,
                label,
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Manage Experience Levels
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Configure trading experience classifications for leads.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                <div className='lg:col-span-1'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                        <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                            <FiPlus className='text-blue-600' /> Add New Level
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
                                    placeholder='e.g., Advanced'
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
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Dropdown Order (0, 1, 2...)
                                </label>
                                <input
                                    type='number'
                                    required
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                            >
                                {isSubmitting ? 'Saving...' : 'Save Experience'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className='lg:col-span-2'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center'>
                            <h2 className='text-sm font-bold text-gray-600 uppercase tracking-wider'>
                                Active Levels ({experiences.length})
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className='p-6 text-center text-gray-500'>
                                Loading...
                            </div>
                        ) : experiences.length === 0 ? (
                            <div className='p-6 text-center text-gray-500'>
                                No levels found.
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
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {experiences.map((exp) => (
                                            <tr
                                                key={exp._id}
                                                className='hover:bg-gray-50'
                                            >
                                                <td className='px-6 py-4 text-sm font-medium text-gray-500'>
                                                    {exp.order}
                                                </td>
                                                <td className='px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2'>
                                                    <FiTrendingUp className='text-gray-400' />{' '}
                                                    {exp.label}
                                                </td>
                                                <td className='px-6 py-4 text-sm font-mono text-gray-500'>
                                                    {exp.name}
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

export default ManageExperiences
