import { useState, useEffect } from 'react'
import api from '../api/axios'
import {
    FiBookOpen,
    FiUser,
    FiCheckCircle,
    FiEdit,
    FiFileText,
    FiAward,
    FiX,
} from 'react-icons/fi'

const StudentRoster = () => {
    const [students, setStudents] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        pincode: '',
        studentAgreementLink: '',
        certificateLink: '',
        status: '',
    })

    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null
    const roleName = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()
    const isAdmin = roleName === 'admin'

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students')
            const allStudents = res.data?.data || []
            setStudents(
                allStudents.filter((s) => s.status !== 'PENDING_ASSIGNMENT'),
            )
        } catch (error) {
            console.error('Failed to fetch students:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    // Modal Handlers
    const handleEditClick = (student) => {
        setSelectedStudent(student)
        setFormData({
            address: student.address || '',
            city: student.city || '',
            pincode: student.pincode || '',
            studentAgreementLink: student.studentAgreementLink || '',
            certificateLink: student.certificateLink || '',
            status: student.status || 'ACTIVE',
        })
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedStudent(null)
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await api.put(
                `/students/${selectedStudent._id}`,
                formData,
            )
            if (res.data.success) {
                // Update local state without refetching
                setStudents(
                    students.map((s) =>
                        s._id === res.data.data._id ? res.data.data : s,
                    ),
                )
                handleCloseModal()
            }
        } catch (error) {
            console.error('Failed to update student:', error)
            alert('Failed to update student details. Check console.')
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
            <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Student Roster
                    </h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        {isAdmin
                            ? 'Global overview of all active students across all faculty.'
                            : 'Your active students and delivery roster.'}
                    </p>
                </div>

                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                    <th className='px-6 py-4 font-medium'>
                                        Student
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Contact
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Courses
                                    </th>
                                    {isAdmin && (
                                        <th className='px-6 py-4 font-medium'>
                                            Faculty
                                        </th>
                                    )}
                                    <th className='px-6 py-4 font-medium'>
                                        Financial Status
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        State
                                    </th>
                                    <th className='px-6 py-4 font-medium text-right'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {students.map((student) => (
                                    <tr
                                        key={student._id}
                                        className='hover:bg-gray-50'
                                    >
                                        <td className='px-6 py-4'>
                                            <div className='font-semibold text-gray-900'>
                                                {student.fullName}
                                            </div>
                                            <div className='text-xs text-gray-400 mt-0.5'>
                                                ID: {student._id.slice(-6)}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 text-gray-500'>
                                            <div className='truncate max-w-[200px]'>
                                                {student.email}
                                            </div>
                                            <div>{student.phone}</div>
                                            {(student.city ||
                                                student.pincode) && (
                                                <div className='text-xs text-gray-400 mt-1'>
                                                    {student.city}{' '}
                                                    {student.pincode}
                                                </div>
                                            )}
                                        </td>
                                        <td className='px-6 py-4'>
                                            <div className='flex flex-col gap-1'>
                                                {student.enrolledCourses.map(
                                                    (course) => (
                                                        <span
                                                            key={course._id}
                                                            className='inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium w-fit'
                                                        >
                                                            <FiBookOpen className='mr-1' />
                                                            {course.courseTitle}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className='px-6 py-4 text-gray-600'>
                                                <div className='flex items-center'>
                                                    <FiUser className='mr-1.5 text-gray-400' />
                                                    {student.assignedFaculty
                                                        ?.firstName ||
                                                        'Unknown'}
                                                </div>
                                            </td>
                                        )}
                                        <td className='px-6 py-4'>
                                            <div className='flex items-center justify-between mb-1'>
                                                <span
                                                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        student.paymentStatus ===
                                                        'PAID'
                                                            ? 'bg-green-100 text-green-700'
                                                            : student.paymentStatus ===
                                                                'PARTIAL'
                                                              ? 'bg-yellow-100 text-yellow-700'
                                                              : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {student.paymentStatus}
                                                </span>
                                            </div>
                                            <div className='text-xs text-gray-500'>
                                                ₹
                                                {student.paidAmount.toLocaleString(
                                                    'en-IN',
                                                )}{' '}
                                                / ₹
                                                {student.totalFee.toLocaleString(
                                                    'en-IN',
                                                )}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span
                                                className={`flex items-center text-xs font-medium w-fit ${
                                                    student.status === 'ACTIVE'
                                                        ? 'text-green-600'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                {student.status ===
                                                    'ACTIVE' && (
                                                    <FiCheckCircle className='mr-1' />
                                                )}
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 text-right'>
                                            <div className='flex items-center justify-end gap-2'>
                                                {student.studentAgreementLink && (
                                                    <a
                                                        href={
                                                            student.studentAgreementLink
                                                        }
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        title='Student Agreement'
                                                        className='text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded-md transition-colors'
                                                    >
                                                        <FiFileText size={16} />
                                                    </a>
                                                )}
                                                {student.certificateLink && (
                                                    <a
                                                        href={
                                                            student.certificateLink
                                                        }
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        title='Course Certificate'
                                                        className='text-amber-500 hover:text-amber-700 p-1 bg-amber-50 rounded-md transition-colors'
                                                    >
                                                        <FiAward size={16} />
                                                    </a>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() =>
                                                            handleEditClick(
                                                                student,
                                                            )
                                                        }
                                                        title='Edit Student'
                                                        className='text-gray-500 hover:text-gray-800 p-1 bg-gray-100 rounded-md transition-colors'
                                                    >
                                                        <FiEdit size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={isAdmin ? 7 : 6}
                                            className='px-6 py-12 text-center text-gray-500'
                                        >
                                            No active students found in the
                                            roster.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Admin Edit Modal */}
            {isModalOpen && isAdmin && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden'>
                        <div className='flex justify-between items-center p-6 border-b border-gray-100'>
                            <h2 className='text-xl font-bold text-gray-900'>
                                Edit Student Details
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Academic Status
                                </label>
                                <select
                                    name='status'
                                    value={formData.status}
                                    onChange={handleChange}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                >
                                    <option value='ACTIVE'>ACTIVE</option>
                                    <option value='GRADUATED'>GRADUATED</option>
                                    <option value='DROPPED'>DROPPED</option>
                                </select>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Street Address
                                    </label>
                                    <input
                                        type='text'
                                        name='address'
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder='e.g. 123 Learning Lane'
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        City
                                    </label>
                                    <input
                                        type='text'
                                        name='city'
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder='e.g. Kolkata'
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Pincode / Zip
                                    </label>
                                    <input
                                        type='text'
                                        name='pincode'
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder='e.g. 700001'
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    />
                                </div>
                            </div>

                            <div className='space-y-4 pt-2 border-t border-gray-100'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Student Agreement URL
                                    </label>
                                    <div className='relative'>
                                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                            <FiFileText className='text-gray-400' />
                                        </div>
                                        <input
                                            type='url'
                                            name='studentAgreementLink'
                                            value={
                                                formData.studentAgreementLink
                                            }
                                            onChange={handleChange}
                                            placeholder='https://drive.google.com/...'
                                            className='w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Course Certificate URL
                                    </label>
                                    <div className='relative'>
                                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                            <FiAward className='text-gray-400' />
                                        </div>
                                        <input
                                            type='url'
                                            name='certificateLink'
                                            value={formData.certificateLink}
                                            onChange={handleChange}
                                            placeholder='https://drive.google.com/...'
                                            className='w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='flex justify-end gap-3 pt-6'>
                                <button
                                    type='button'
                                    onClick={handleCloseModal}
                                    className='px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentRoster
