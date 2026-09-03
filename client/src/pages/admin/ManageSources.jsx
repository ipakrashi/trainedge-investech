import { useState, useEffect } from 'react'
import api from '../../api/axios.js' // Adjust path if necessary
import { FiPlus, FiTarget } from 'react-icons/fi'

const ManageSources = () => {
    const [sources, setSources] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')

    // Form State
    const [label, setLabel] = useState('')
    const [name, setName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchSources = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/sources')
            setSources(res.data.data || [])
            setError(null)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch sources')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSources()
    }, [])

    // UX Feature: Auto-generate the uppercase slug name when typing the label
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

            await api.post('/sources', { name, label })

            setSuccessMsg('Source added successfully!')
            setLabel('')
            setName('')
            fetchSources() // Refresh list

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Failed to add source. It might already exist.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Manage Lead Sources
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Add and configure the origin sources for your leads.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Form Section */}
                <div className='lg:col-span-1'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                        <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                            <FiPlus className='text-blue-600' /> Add New Source
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
                                    placeholder='e.g., Google Ads'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    System Name * (Auto-generated)
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
                                    placeholder='e.g., GOOGLE_ADS'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500'
                                />
                                <p className='text-xs text-gray-400 mt-1'>
                                    Used securely in the database backend.
                                </p>
                            </div>
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
                            >
                                {isSubmitting ? 'Saving...' : 'Save Source'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className='lg:col-span-2'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center'>
                            <h2 className='text-sm font-bold text-gray-600 uppercase tracking-wider'>
                                Active Sources ({sources.length})
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className='p-6 text-center text-gray-500'>
                                Loading sources...
                            </div>
                        ) : sources.length === 0 ? (
                            <div className='p-6 text-center text-gray-500'>
                                No sources found. Add your first one!
                            </div>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left border-collapse'>
                                    <thead>
                                        <tr className='border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider'>
                                            <th className='px-6 py-3 font-medium'>
                                                Display Label
                                            </th>
                                            <th className='px-6 py-3 font-medium'>
                                                System Name
                                            </th>
                                            <th className='px-6 py-3 font-medium'>
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {sources.map((source) => (
                                            <tr
                                                key={source._id}
                                                className='hover:bg-gray-50'
                                            >
                                                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                                                    <div className='flex items-center gap-2'>
                                                        <FiTarget className='text-gray-400' />
                                                        {source.label}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4 text-sm font-mono text-gray-500'>
                                                    {source.name}
                                                </td>
                                                <td className='px-6 py-4 text-sm'>
                                                    <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
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
        </div>
    )
}

export default ManageSources
