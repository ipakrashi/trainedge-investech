// src/pages/StudentRoster.jsx
import { useState, useEffect } from 'react'
import api from '../api/axios'
import { FiBookOpen, FiUser, FiCheckCircle } from 'react-icons/fi'

const StudentRoster = () => {
    const [students, setStudents] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null
    const roleName = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()
    const isAdmin = roleName === 'admin'

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get('/students')
                const allStudents = res.data?.data || []
                // Filter out pending students (only show ACTIVE, GRADUATED, DROPPED)
                setStudents(
                    allStudents.filter(
                        (s) => s.status !== 'PENDING_ASSIGNMENT',
                    ),
                )
            } catch (error) {
                console.error('Failed to fetch students:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStudents()
    }, [])

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
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={isAdmin ? 6 : 5}
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
        </div>
    )
}

export default StudentRoster
