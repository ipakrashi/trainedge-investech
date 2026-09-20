// src/pages/admin/PendingStudents.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
    FiCheckCircle,
    FiClock,
    FiUser,
    FiMail,
    FiPhone,
    FiBookOpen,
    FiX,
    FiLayers,
} from 'react-icons/fi'

const PendingStudents = () => {
    const [pendingStudents, setPendingStudents] = useState([])
    const [faculties, setFaculties] = useState([])
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        assignedFaculty: '',
        enrolledCourses: [],
        totalFee: 0,
    })

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [studentsRes, usersRes, coursesRes] = await Promise.all([
                api.get('/students'),
                api.get('/users'),
                api.get('/courses'),
            ])

            // Filter only pending students
            const allStudents = studentsRes.data?.data || []
            setPendingStudents(
                allStudents.filter((s) => s.status === 'PENDING_ASSIGNMENT'),
            )

            // Filter faculty users
            const allUsers = usersRes.data?.data || usersRes.data || []
            setFaculties(
                allUsers.filter(
                    (u) =>
                        (u.role?.name || u.role || '').toLowerCase() ===
                        'faculty',
                ),
            )

            setCourses(coursesRes.data?.data || [])
        } catch (error) {
            console.error('Failed to fetch mapping data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenModal = (student) => {
        setSelectedStudent(student)
        setFormData({
            assignedFaculty: '',
            enrolledCourses: [],
            totalFee: 0,
        })
        setIsModalOpen(true)
    }

    const handleCourseToggle = (course) => {
        setFormData((prev) => {
            const isSelected = prev.enrolledCourses.includes(course._id)
            const updatedCourses = isSelected
                ? prev.enrolledCourses.filter((id) => id !== course._id)
                : [...prev.enrolledCourses, course._id]

            // Calculate auto fee based on selected courses
            const updatedFee = courses
                .filter((c) => updatedCourses.includes(c._id))
                .reduce((sum, c) => sum + (c.fee || 0), 0)

            return {
                ...prev,
                enrolledCourses: updatedCourses,
                totalFee: updatedFee,
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (
            !formData.assignedFaculty ||
            formData.enrolledCourses.length === 0
        ) {
            return alert(
                'Please assign a faculty member and at least one course.',
            )
        }

        setIsSubmitting(true)
        try {
            await api.put(
                `/students/${selectedStudent._id}/map-faculty`,
                formData,
            )
            setIsModalOpen(false)
            fetchData()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to map student.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const hasPending = pendingStudents && pendingStudents.length > 0

    return (
        <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header Banner */}
                <div className='mb-6 sm:mb-8'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                        Action Required: Pending Enrollments
                    </h1>
                    <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                        Converted prospective leads awaiting curriculum mapping
                        and faculty assignment.
                    </p>
                </div>

                {isLoading ? (
                    <div className='flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3'></div>
                        <span className='text-sm text-gray-500 font-medium'>
                            Loading pending students...
                        </span>
                    </div>
                ) : !hasPending ? (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center'>
                        <FiCheckCircle className='mx-auto text-4xl text-green-500 mb-3' />
                        <h3 className='text-lg font-bold text-gray-900'>
                            All caught up!
                        </h3>
                        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                            There are no pending students waiting for course or
                            faculty mapping.
                        </p>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        {/* Status Strip */}
                        <div className='px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between'>
                            <h3 className='font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2'>
                                <FiClock className='text-orange-500' /> Pending
                                Roster
                            </h3>
                            <span className='text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full'>
                                {pendingStudents.length}{' '}
                                {pendingStudents.length === 1
                                    ? 'Student'
                                    : 'Students'}{' '}
                                Pending
                            </span>
                        </div>

                        {/* 1. MOBILE CARD VIEW (< md screens) */}
                        <div className='block md:hidden divide-y divide-gray-100'>
                            {pendingStudents.map((student) => (
                                <div
                                    key={student._id}
                                    className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                                >
                                    {/* Top: Name & Pending Badge */}
                                    <div className='flex items-start justify-between gap-2'>
                                        <div>
                                            <div className='font-bold text-gray-900 text-base'>
                                                {student.fullName}
                                            </div>
                                            <span className='text-[11px] text-orange-600 font-medium flex items-center gap-1 mt-0.5'>
                                                <FiClock /> Awaiting Assignment
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleOpenModal(student)
                                            }
                                            className='bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm'
                                        >
                                            Map Student
                                        </button>
                                    </div>

                                    {/* Details Grid */}
                                    <div className='grid grid-cols-1 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-600'>
                                        <div className='flex items-center gap-2 truncate'>
                                            <FiMail className='text-gray-400 flex-shrink-0' />
                                            <span className='truncate'>
                                                {student.email}
                                            </span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <FiPhone className='text-gray-400 flex-shrink-0' />
                                            <span>{student.phone}</span>
                                        </div>
                                        <div className='flex items-center gap-2 pt-1 border-t border-gray-200/60'>
                                            <FiUser className='text-gray-400 flex-shrink-0' />
                                            <span>
                                                Sales Counselor:{' '}
                                                {student.salesCounselor ? (
                                                    <span className='font-mono font-medium text-gray-800'>
                                                        ID:{' '}
                                                        {student.salesCounselor
                                                            .toString()
                                                            .slice(-6)}
                                                    </span>
                                                ) : (
                                                    <span className='italic text-gray-400'>
                                                        Unassigned
                                                    </span>
                                                )}
                                            </span>
                                        </div>
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
                                            Student Details
                                        </th>
                                        <th className='px-6 py-4'>Contact</th>
                                        <th className='px-6 py-4'>
                                            Sales Counselor
                                        </th>
                                        <th className='px-6 py-4 text-right'>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {pendingStudents.map((student) => (
                                        <tr
                                            key={student._id}
                                            className='hover:bg-gray-50 transition-colors'
                                        >
                                            <td className='px-6 py-4'>
                                                <div className='font-semibold text-gray-900'>
                                                    {student.fullName}
                                                </div>
                                                <div className='text-xs text-orange-600 font-medium flex items-center mt-1'>
                                                    <FiClock className='mr-1' />{' '}
                                                    Pending Assignment
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-gray-600'>
                                                <div>{student.email}</div>
                                                <div className='text-xs text-gray-400 mt-0.5'>
                                                    {student.phone}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-gray-600'>
                                                {student.salesCounselor ? (
                                                    <span className='font-mono bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700'>
                                                        ID:{' '}
                                                        {student.salesCounselor
                                                            .toString()
                                                            .slice(-6)}
                                                    </span>
                                                ) : (
                                                    <span className='text-xs text-gray-400 italic'>
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className='px-6 py-4 text-right'>
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(student)
                                                    }
                                                    className='bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors'
                                                >
                                                    Map Student
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

            {/* MAPPING MODAL */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]'>
                        {/* Modal Header */}
                        <div className='flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 bg-gray-50 shrink-0'>
                            <div>
                                <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
                                    Map Student: {selectedStudent?.fullName}
                                </h2>
                                <p className='text-xs text-gray-500 mt-0.5'>
                                    Complete course allocation and instructor
                                    mapping to activate profile.
                                </p>
                            </div>
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
                            className='p-5 sm:p-6 space-y-5 overflow-y-auto flex-1'
                        >
                            {/* Course Selection Multiselect */}
                            <div>
                                <label className='block text-xs font-semibold text-gray-700 uppercase mb-2 flex items-center justify-between'>
                                    <span>Select Enrolled Course(s) *</span>
                                    <span className='text-blue-600 font-bold lowercase text-xs'>
                                        {formData.enrolledCourses.length}{' '}
                                        selected
                                    </span>
                                </label>
                                <div className='max-h-44 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1.5 bg-gray-50'>
                                    {courses.map((course) => {
                                        const isChecked =
                                            formData.enrolledCourses.includes(
                                                course._id,
                                            )
                                        return (
                                            <label
                                                key={course._id}
                                                className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer border transition-colors ${
                                                    isChecked
                                                        ? 'bg-blue-50/50 border-blue-200'
                                                        : 'hover:bg-white border-transparent'
                                                }`}
                                            >
                                                <div className='flex items-center gap-2.5 truncate mr-2'>
                                                    <input
                                                        type='checkbox'
                                                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4'
                                                        checked={isChecked}
                                                        onChange={() =>
                                                            handleCourseToggle(
                                                                course,
                                                            )
                                                        }
                                                    />
                                                    <span className='text-xs sm:text-sm font-medium text-gray-900 truncate'>
                                                        {course.courseTitle}
                                                    </span>
                                                </div>
                                                <span className='text-xs font-bold text-gray-700 flex-shrink-0'>
                                                    ₹
                                                    {(
                                                        course.fee || 0
                                                    ).toLocaleString('en-IN')}
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Faculty Assignment & Fee Grid */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        Assign Lead Faculty *
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
                                    >
                                        <option value='' disabled>
                                            Select Faculty
                                        </option>
                                        {faculties.map((f) => (
                                            <option key={f._id} value={f._id}>
                                                {f.firstName} {f.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                        Agreed Total Fee (₹) *
                                    </label>
                                    <input
                                        required
                                        type='number'
                                        min='0'
                                        value={formData.totalFee}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                totalFee: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className='w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className='flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50'
                                >
                                    <FiCheckCircle />
                                    {isSubmitting
                                        ? 'Activating...'
                                        : 'Activate Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PendingStudents
