// src/pages/BatchesOverview.jsx
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
    FiEdit2,
    FiX,
    FiCheck,
} from 'react-icons/fi'

const BatchesOverview = () => {
    const [batches, setBatches] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // --- EDIT BATCH STATE ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState(null)
    const [editForm, setEditForm] = useState({
        batchName: '',
        course: '',
        faculty: '',
        startDate: '',
        endDate: '',
        status: 'UPCOMING',
    })
    const [courses, setCourses] = useState([])
    const [facultyList, setFacultyList] = useState([])
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

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
        if (isAdmin) {
            fetchCoursesAndFaculty()
        }
    }, [isAdmin])

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

    const fetchCoursesAndFaculty = async () => {
        try {
            const [coursesRes, usersRes] = await Promise.all([
                axios.get('/api/courses', { withCredentials: true }),
                axios.get('/api/users', { withCredentials: true }),
            ])
            setCourses(coursesRes.data.data || coursesRes.data || [])
            const users = usersRes.data.data || usersRes.data || []
            setFacultyList(
                users.filter((u) => {
                    const r = (u.role?.name || u.role || '').toLowerCase()
                    return r === 'faculty'
                }),
            )
        } catch (err) {
            console.error(
                'Failed to load courses or faculty for edit modal',
                err,
            )
        }
    }

    const handleOpenEdit = (e, batch) => {
        e.stopPropagation() // Prevent card click navigation
        setSelectedBatch(batch)
        setEditForm({
            batchName: batch.batchName || '',
            course: batch.course?._id || batch.course || '',
            faculty: batch.faculty?._id || batch.faculty || '',
            startDate: batch.startDate ? batch.startDate.slice(0, 10) : '',
            endDate: batch.endDate ? batch.endDate.slice(0, 10) : '',
            status: batch.status || 'UPCOMING',
        })
        setIsEditModalOpen(true)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setIsSubmittingEdit(true)
        try {
            await axios.put(`/api/batches/${selectedBatch._id}`, editForm, {
                withCredentials: true,
            })
            setIsEditModalOpen(false)
            fetchBatches()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update batch')
        } finally {
            setIsSubmittingEdit(false)
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
                            onClick={() => setIsCreateModalOpen(true)}
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
                            className='bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col relative'
                        >
                            <div className='p-5 flex-grow'>
                                <div className='flex justify-between items-start mb-4'>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(batch.status)}`}
                                    >
                                        {batch.status}
                                    </span>
                                    <div className='flex items-center gap-2'>
                                        {isAdmin && (
                                            <button
                                                onClick={(e) =>
                                                    handleOpenEdit(e, batch)
                                                }
                                                title='Edit Batch'
                                                className='p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-colors'
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                        )}
                                        <FiChevronRight className='text-gray-400' />
                                    </div>
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

            {/* Create Batch Modal */}
            <CreateBatchModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false)
                    fetchBatches()
                }}
            />

            {/* Admin Edit Batch Modal */}
            {isEditModalOpen && isAdmin && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden'>
                        <div className='flex justify-between items-center p-6 border-b border-gray-100'>
                            <h2 className='text-xl font-bold text-gray-900'>
                                Edit Batch Record
                            </h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleEditSubmit}
                            className='p-6 space-y-4'
                        >
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Batch Name
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={editForm.batchName}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            batchName: e.target.value,
                                        })
                                    }
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Course
                                    </label>
                                    <select
                                        required
                                        value={editForm.course}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                course: e.target.value,
                                            })
                                        }
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white'
                                    >
                                        <option value=''>Select Course</option>
                                        {courses.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.courseTitle}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Assigned Faculty
                                    </label>
                                    <select
                                        required
                                        value={editForm.faculty}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                faculty: e.target.value,
                                            })
                                        }
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white'
                                    >
                                        <option value=''>Select Faculty</option>
                                        {facultyList.map((f) => (
                                            <option key={f._id} value={f._id}>
                                                {f.firstName} {f.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Start Date
                                    </label>
                                    <input
                                        type='date'
                                        required
                                        value={editForm.startDate}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                startDate: e.target.value,
                                            })
                                        }
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Status
                                    </label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                status: e.target.value,
                                            })
                                        }
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white'
                                    >
                                        <option value='UPCOMING'>
                                            UPCOMING
                                        </option>
                                        <option value='ACTIVE'>ACTIVE</option>
                                        <option value='COMPLETED'>
                                            COMPLETED
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className='flex justify-end gap-3 pt-6 border-t border-gray-100'>
                                <button
                                    type='button'
                                    onClick={() => setIsEditModalOpen(false)}
                                    className='px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isSubmittingEdit}
                                    className='px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center'
                                >
                                    {isSubmittingEdit ? (
                                        'Saving...'
                                    ) : (
                                        <>
                                            <FiCheck className='mr-1.5' /> Save
                                            Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BatchesOverview
