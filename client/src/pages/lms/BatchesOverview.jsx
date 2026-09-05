import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CreateBatchModal from '../../components/lms/CreateBatchModal'
import {
    FiUsers,
    FiCalendar,
    FiBookOpen,
    FiPlus,
    FiChevronRight,
} from 'react-icons/fi'

const BatchesOverview = () => {
    const [batches, setBatches] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null
    const userRole = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()
    const isAdmin = userRole === 'admin'

    useEffect(() => {
        fetchBatches()
    }, [])

    const fetchBatches = async () => {
        try {
            setIsLoading(true)
            const { data } = await axios.get('/api/batches', {
                withCredentials: true,
            })
            setBatches(data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch batches')
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'UPCOMING':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            {/* Header Section */}
            <div className='sm:flex sm:items-center sm:justify-between mb-8'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        {isAdmin
                            ? 'Global Batches & Cohorts'
                            : 'My Assigned Batches'}
                    </h1>
                    <p className='mt-2 text-sm text-gray-600'>
                        {isAdmin
                            ? 'Manage all active training cohorts, assign faculty, and monitor batch lifecycles.'
                            : 'Access your class rosters, log daily sessions, and manage student evaluations.'}
                    </p>
                </div>
                {isAdmin && (
                    <div className='mt-4 sm:mt-0'>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className='inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                        >
                            <FiPlus className='-ml-1 mr-2 h-5 w-5' />
                            Create New Batch
                        </button>
                    </div>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className='bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 mb-6'>
                    {error}
                </div>
            )}

            {/* Data Grid / Loading State */}
            {isLoading ? (
                <div className='flex justify-center items-center h-64'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                </div>
            ) : batches.length === 0 ? (
                <div className='text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12'>
                    <FiUsers className='mx-auto h-12 w-12 text-gray-300' />
                    <h3 className='mt-2 text-sm font-medium text-gray-900'>
                        No batches found
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                        {isAdmin
                            ? 'Get started by creating a new training batch.'
                            : 'You have not been assigned to any active batches yet.'}
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {batches.map((batch) => (
                        <div
                            key={batch._id}
                            onClick={() => navigate(`/batches/${batch._id}`)}
                            className='bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col'
                        >
                            <div className='p-5 flex-grow'>
                                <div className='flex justify-between items-start mb-4'>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(batch.status)}`}
                                    >
                                        {batch.status}
                                    </span>
                                    <FiChevronRight className='text-gray-400' />
                                </div>
                                <h3 className='text-lg font-bold text-gray-900 mb-1 truncate'>
                                    {batch.batchName}
                                </h3>
                                <p className='text-sm text-blue-600 font-medium mb-4 truncate'>
                                    {batch.course?.courseTitle ||
                                        'Course Unassigned'}
                                </p>

                                <div className='space-y-2'>
                                    <div className='flex items-center text-sm text-gray-600'>
                                        <FiCalendar className='mr-2 text-gray-400' />
                                        {new Date(
                                            batch.startDate,
                                        ).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    <div className='flex items-center text-sm text-gray-600'>
                                        <FiUsers className='mr-2 text-gray-400' />
                                        {batch.students?.length || 0} Students
                                        Enrolled
                                    </div>
                                    {isAdmin && (
                                        <div className='flex items-center text-sm text-gray-600'>
                                            <FiBookOpen className='mr-2 text-gray-400' />
                                            Faculty: {batch.faculty?.firstName}{' '}
                                            {batch.faculty?.lastName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='bg-gray-50 px-5 py-3 border-t border-gray-100'>
                                <span className='text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center'>
                                    View Class Dashboard
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <CreateBatchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false)
                    fetchBatches()
                }}
            />
        </div>
    )
}

export default BatchesOverview
