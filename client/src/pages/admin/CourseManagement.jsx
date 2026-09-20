// src/pages/admin/CourseManagement.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
    FiEdit2,
    FiTrash2,
    FiPlus,
    FiUser,
    FiClock,
    FiBook,
    FiX,
    FiDollarSign,
} from 'react-icons/fi'

const CourseManagement = () => {
    const [courses, setCourses] = useState([])
    const [faculties, setFaculties] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        courseTitle: '',
        category: 'DERIVATIVES',
        fee: 0,
        durationWeeks: 4,
        assignedFaculty: '',
    })

    const fetchInitialData = async () => {
        try {
            setIsLoading(true)
            const [coursesRes, usersRes] = await Promise.all([
                api.get('/courses'),
                api.get('/users'),
            ])

            setCourses(coursesRes.data.data || [])

            const allUsers = usersRes.data.data || []
            const facultyMembers = allUsers.filter(
                (user) =>
                    (user.role?.name || user.role || '').toLowerCase() ===
                    'faculty',
            )
            setFaculties(facultyMembers)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [])

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course)
            setFormData({
                courseTitle: course.courseTitle || '',
                category: course.category || 'DERIVATIVES',
                fee: course.fee ?? 0,
                durationWeeks: course.durationWeeks ?? 4,
                assignedFaculty:
                    course.assignedFaculty?._id || course.assignedFaculty || '',
            })
        } else {
            setEditingCourse(null)
            setFormData({
                courseTitle: '',
                category: 'DERIVATIVES',
                fee: 0,
                durationWeeks: 4,
                assignedFaculty: faculties.length > 0 ? faculties[0]._id : '',
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.assignedFaculty) {
            alert('Please assign a faculty member to this course.')
            return
        }

        setIsSubmitting(true)
        try {
            if (editingCourse) {
                await api.put(`/courses/${editingCourse._id}`, formData)
            } else {
                await api.post('/courses', formData)
            }
            setIsModalOpen(false)
            fetchInitialData()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save course')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (
            window.confirm(
                'Delete this course? It will be removed from future cohort and lead assignments.',
            )
        ) {
            try {
                await api.delete(`/courses/${id}`)
                fetchInitialData()
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete course')
            }
        }
    }

    const getCategoryBadgeClass = (category) => {
        switch (category) {
            case 'DERIVATIVES':
                return 'bg-purple-50 text-purple-700 border-purple-200'
            case 'EQUITY':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'CURRENCY':
                return 'bg-amber-50 text-amber-700 border-amber-200'
            case 'COMPREHENSIVE':
                return 'bg-green-50 text-green-700 border-green-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header Banner */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8'>
                    <div>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                            Course Management
                        </h1>
                        <p className='text-gray-500 text-xs sm:text-sm mt-1'>
                            Configure curriculum offerings, pricing models, and
                            lead instructors.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className='bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto'
                    >
                        <FiPlus className='mr-2' /> Add Course
                    </button>
                </div>

                {/* Main Content Area */}
                {isLoading ? (
                    <div className='flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3'></div>
                        <span className='text-sm text-gray-500 font-medium'>
                            Loading course catalog...
                        </span>
                    </div>
                ) : courses.length === 0 ? (
                    <div className='text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
                        <FiBook className='mx-auto h-12 w-12 text-gray-300 mb-3' />
                        <h3 className='text-base font-semibold text-gray-900'>
                            No courses defined
                        </h3>
                        <p className='text-sm text-gray-500 mt-1'>
                            Get started by creating your first course offering.
                        </p>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        {/* 1. MOBILE CARD VIEW (< md screens) */}
                        <div className='block md:hidden divide-y divide-gray-100'>
                            {courses.map((course) => (
                                <div
                                    key={course._id}
                                    className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                                >
                                    {/* Top Row: Course Title & Category Badge */}
                                    <div className='flex items-start justify-between gap-2'>
                                        <div className='font-bold text-gray-900 text-base'>
                                            {course.courseTitle}
                                        </div>
                                        <span
                                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${getCategoryBadgeClass(
                                                course.category,
                                            )}`}
                                        >
                                            {course.category}
                                        </span>
                                    </div>

                                    {/* Middle Details Grid */}
                                    <div className='grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs'>
                                        <div>
                                            <span className='text-[10px] uppercase font-bold text-gray-400 tracking-wider block'>
                                                Assigned Faculty
                                            </span>
                                            <span className='font-medium text-gray-800 flex items-center gap-1.5 mt-0.5'>
                                                <FiUser className='text-gray-400 flex-shrink-0' />
                                                <span className='truncate'>
                                                    {course.assignedFaculty
                                                        ? `${course.assignedFaculty.firstName} ${course.assignedFaculty.lastName}`
                                                        : 'Unassigned'}
                                                </span>
                                            </span>
                                        </div>

                                        <div>
                                            <span className='text-[10px] uppercase font-bold text-gray-400 tracking-wider block'>
                                                Duration
                                            </span>
                                            <span className='font-medium text-gray-800 flex items-center gap-1.5 mt-0.5'>
                                                <FiClock className='text-gray-400 flex-shrink-0' />
                                                <span>
                                                    {course.durationWeeks ?? 4}{' '}
                                                    Weeks
                                                </span>
                                            </span>
                                        </div>

                                        <div className='col-span-2 pt-1 border-t border-gray-200/60 flex items-center justify-between'>
                                            <span className='text-[10px] uppercase font-bold text-gray-400 tracking-wider'>
                                                Fee
                                            </span>
                                            <span className='font-bold text-gray-900 text-sm'>
                                                ₹
                                                {(
                                                    course.fee || 0
                                                ).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Action Buttons */}
                                    <div className='flex items-center justify-end gap-2 pt-1'>
                                        <button
                                            onClick={() =>
                                                handleOpenModal(course)
                                            }
                                            className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
                                        >
                                            <FiEdit2 size={13} /> Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(course._id)
                                            }
                                            className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
                                        >
                                            <FiTrash2 size={13} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
                        <div className='hidden md:block overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='bg-gray-50 text-gray-900 font-bold text-xs uppercase tracking-wider border-b border-gray-100'>
                                        <th className='px-6 py-4'>
                                            Course Title
                                        </th>
                                        <th className='px-6 py-4'>Category</th>
                                        <th className='px-6 py-4'>Faculty</th>
                                        <th className='px-6 py-4'>Duration</th>
                                        <th className='px-6 py-4'>Fee</th>
                                        <th className='px-6 py-4 text-right'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {courses.map((course) => (
                                        <tr
                                            key={course._id}
                                            className='hover:bg-gray-50 transition-colors'
                                        >
                                            <td className='px-6 py-4 font-semibold text-gray-900'>
                                                {course.courseTitle}
                                            </td>
                                            <td className='px-6 py-4'>
                                                <span
                                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                                                        course.category,
                                                    )}`}
                                                >
                                                    {course.category}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-gray-700'>
                                                <div className='flex items-center'>
                                                    <FiUser className='mr-1.5 text-gray-400' />
                                                    <span>
                                                        {course.assignedFaculty
                                                            ? `${course.assignedFaculty.firstName} ${course.assignedFaculty.lastName}`
                                                            : 'Unassigned'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-gray-600'>
                                                <div className='flex items-center text-xs'>
                                                    <FiClock className='mr-1.5 text-gray-400' />
                                                    {course.durationWeeks ?? 4}{' '}
                                                    Weeks
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-gray-900 font-semibold'>
                                                ₹
                                                {(
                                                    course.fee || 0
                                                ).toLocaleString('en-IN')}
                                            </td>
                                            <td className='px-6 py-4 text-right space-x-2'>
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(course)
                                                    }
                                                    className='text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors'
                                                    title='Edit Course'
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(course._id)
                                                    }
                                                    className='text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors'
                                                    title='Delete Course'
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT COURSE MODAL */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]'>
                        {/* Modal Header */}
                        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0'>
                            <h2 className='text-lg font-bold text-gray-900'>
                                {editingCourse
                                    ? 'Edit Course Blueprint'
                                    : 'Define New Course'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form
                            onSubmit={handleSubmit}
                            className='p-6 space-y-4 overflow-y-auto flex-1'
                        >
                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Course Title
                                </label>
                                <input
                                    required
                                    type='text'
                                    placeholder='e.g., Advanced Options & Volatility Trading'
                                    value={formData.courseTitle}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            courseTitle: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                />
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                category: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white'
                                    >
                                        <option value='DERIVATIVES'>
                                            Derivatives
                                        </option>
                                        <option value='EQUITY'>Equity</option>
                                        <option value='COMPREHENSIVE'>
                                            Comprehensive
                                        </option>
                                        <option value='CURRENCY'>
                                            Currency
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        Fee (₹)
                                    </label>
                                    <div className='relative'>
                                        <input
                                            required
                                            type='number'
                                            min='0'
                                            step='500'
                                            value={formData.fee}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    fee: Number(e.target.value),
                                                })
                                            }
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        Duration (Wks)
                                    </label>
                                    <input
                                        required
                                        type='number'
                                        min='1'
                                        max='52'
                                        value={formData.durationWeeks}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                durationWeeks: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                            </div>

                            {/* Faculty Assignment Dropdown */}
                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                    Assigned Lead Faculty
                                </label>
                                <select
                                    required
                                    value={formData.assignedFaculty}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            assignedFaculty: e.target.value,
                                        })
                                    }
                                    className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white'
                                    disabled={faculties.length === 0}
                                >
                                    <option value='' disabled>
                                        Select a faculty member
                                    </option>
                                    {faculties.map((faculty) => (
                                        <option
                                            key={faculty._id}
                                            value={faculty._id}
                                        >
                                            {faculty.firstName}{' '}
                                            {faculty.lastName} ({faculty.email})
                                        </option>
                                    ))}
                                </select>
                                {faculties.length === 0 && (
                                    <p className='text-xs text-red-500 mt-1'>
                                        No active users with role "faculty"
                                        found. Create one in User Management.
                                    </p>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className='flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors'
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingCourse
                                          ? 'Update Course'
                                          : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CourseManagement
