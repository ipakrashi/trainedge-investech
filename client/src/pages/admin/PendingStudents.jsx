// src/pages/admin/PendingStudents.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiCheckCircle, FiClock } from 'react-icons/fi'

const PendingStudents = () => {
    const [pendingStudents, setPendingStudents] = useState([])
    const [faculties, setFaculties] = useState([])
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)

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

    const handleCourseToggle = (courseId) => {
        setFormData((prev) => {
            const isSelected = prev.enrolledCourses.includes(courseId)
            return {
                ...prev,
                enrolledCourses: isSelected
                    ? prev.enrolledCourses.filter((id) => id !== courseId)
                    : [...prev.enrolledCourses, courseId],
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

        try {
            await api.put(
                `/students/${selectedStudent._id}/map-faculty`,
                formData,
            )
            setIsModalOpen(false)
            fetchData() // Refresh lists
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to map student.')
        }
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center mb-8'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Action Required: Pending Enrollments
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            These leads have converted. Map them to a Faculty
                            member and Course to activate their student profile.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className='text-center py-12'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                    </div>
                ) : pendingStudents.length === 0 ? (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center'>
                        <FiCheckCircle className='mx-auto text-4xl text-green-500 mb-3' />
                        <h3 className='text-lg font-medium text-gray-900'>
                            All caught up!
                        </h3>
                        <p className='text-gray-500 mt-1'>
                            There are no pending students waiting for faculty
                            assignment.
                        </p>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        {/* MOBILE RESPONSIVE FIX: Added overflow-x-auto wrapper */}
                        <div className='overflow-x-auto'>
                            {/* MOBILE RESPONSIVE FIX: Added whitespace-nowrap to prevent ugly squishing */}
                            <table className='w-full text-left border-collapse whitespace-nowrap'>
                                <thead>
                                    <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                        <th className='px-6 py-4 font-medium'>
                                            Student Details
                                        </th>
                                        <th className='px-6 py-4 font-medium'>
                                            Contact
                                        </th>
                                        <th className='px-6 py-4 font-medium'>
                                            Sales Counselor
                                        </th>
                                        <th className='px-6 py-4 text-right font-medium'>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 text-sm'>
                                    {pendingStudents.map((student) => (
                                        <tr
                                            key={student._id}
                                            className='hover:bg-gray-50'
                                        >
                                            <td className='px-6 py-4'>
                                                <div className='font-medium text-gray-900'>
                                                    {student.fullName}
                                                </div>
                                                <div className='text-xs text-orange-500 flex items-center mt-1'>
                                                    <FiClock className='mr-1' />{' '}
                                                    Pending Assignment
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-gray-500'>
                                                <div>{student.email}</div>
                                                <div>{student.phone}</div>
                                            </td>
                                            <td className='px-6 py-4 text-gray-500'>
                                                {student.salesCounselor ? (
                                                    <span className='bg-gray-100 px-2 py-1 rounded text-xs'>
                                                        Closed by ID:{' '}
                                                        {student.salesCounselor
                                                            .toString()
                                                            .slice(-6)}
                                                    </span>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                            <td className='px-6 py-4 text-right'>
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(student)
                                                    }
                                                    className='bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
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

            {/* Mapping Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden p-6'>
                        <h2 className='text-xl font-bold mb-1 text-gray-900'>
                            Map Student: {selectedStudent?.fullName}
                        </h2>
                        <p className='text-xs text-gray-500 mb-6'>
                            Complete delivery details to activate this student.
                        </p>

                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Select Course(s)
                                </label>
                                <div className='max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2 bg-gray-50 custom-scrollbar'>
                                    {courses.map((course) => (
                                        <label
                                            key={course._id}
                                            className='flex items-center p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200 transition-colors'
                                        >
                                            <input
                                                type='checkbox'
                                                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                                checked={formData.enrolledCourses.includes(
                                                    course._id,
                                                )}
                                                onChange={() =>
                                                    handleCourseToggle(
                                                        course._id,
                                                    )
                                                }
                                            />
                                            <div className='ml-3'>
                                                <span className='block text-sm font-medium text-gray-900'>
                                                    {course.courseTitle}
                                                </span>
                                                <span className='block text-xs text-gray-500'>
                                                    ₹
                                                    {course.fee.toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Assign Faculty
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
                                        className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
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
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Final Total Fee (₹)
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
                                        className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                            </div>

                            <div className='flex justify-end gap-3 mt-8 pt-4 border-t'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 border rounded-lg text-sm hover:bg-gray-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-sm flex items-center'
                                >
                                    <FiCheckCircle className='mr-2' /> Activate
                                    Student
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
