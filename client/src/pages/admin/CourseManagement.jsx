import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'

const CourseManagement = () => {
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState(null)

    // Form State
    const [formData, setFormData] = useState({
        courseTitle: '',
        category: 'TRADING',
        fee: 0,
        description: '',
    })

    const fetchCourses = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/courses')
            setCourses(res.data.data || [])
        } catch (err) {
            console.error('Failed to fetch courses:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course)
            setFormData({
                courseTitle: course.courseTitle,
                category: course.category,
                fee: course.fee,
                description: course.description || '',
            })
        } else {
            setEditingCourse(null)
            setFormData({
                courseTitle: '',
                category: 'TRADING',
                fee: 0,
                description: '',
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingCourse) {
                await api.put(`/courses/${editingCourse._id}`, formData)
            } else {
                await api.post('/courses', formData)
            }
            setIsModalOpen(false)
            fetchCourses()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save course')
        }
    }

    const handleDelete = async (id) => {
        if (
            window.confirm(
                'Delete this course? It will be removed from future lead selections.',
            )
        ) {
            try {
                await api.delete(`/courses/${id}`)
                fetchCourses()
            } catch (err) {
                alert('Failed to delete course')
            }
        }
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center mb-8'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Course Management
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            Add or modify the courses offered by trainEdge.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center'
                    >
                        <FiPlus className='mr-2' /> Add Course
                    </button>
                </div>

                {isLoading ? (
                    <div className='text-center py-12'>Loading courses...</div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                    <th className='px-6 py-4 font-medium'>
                                        Course Title
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Category
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Fee
                                    </th>
                                    <th className='px-6 py-4 text-right font-medium'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {courses.map((course) => (
                                    <tr
                                        key={course._id}
                                        className='hover:bg-gray-50'
                                    >
                                        <td className='px-6 py-4 font-medium text-gray-900'>
                                            {course.courseTitle}
                                        </td>
                                        <td className='px-6 py-4 text-gray-500'>
                                            {course.category}
                                        </td>
                                        <td className='px-6 py-4 text-gray-900'>
                                            ₹
                                            {course.fee.toLocaleString('en-IN')}
                                        </td>
                                        <td className='px-6 py-4 text-right space-x-3'>
                                            <button
                                                onClick={() =>
                                                    handleOpenModal(course)
                                                }
                                                className='text-blue-600 hover:text-blue-800'
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(course._id)
                                                }
                                                className='text-red-600 hover:text-red-800'
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Simple Inline Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6'>
                        <h2 className='text-xl font-bold mb-4'>
                            {editingCourse ? 'Edit Course' : 'Add Course'}
                        </h2>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Course Title
                                </label>
                                <input
                                    required
                                    type='text'
                                    value={formData.courseTitle}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            courseTitle: e.target.value,
                                        })
                                    }
                                    className='w-full border rounded-lg px-3 py-2 text-sm'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
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
                                    className='w-full border rounded-lg px-3 py-2 text-sm'
                                >
                                    <option value='TRADING'>Trading</option>
                                    <option value='INVESTING'>Investing</option>
                                    <option value='TECHNICAL_ANALYSIS'>
                                        Technical Analysis
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Fee (₹)
                                </label>
                                <input
                                    required
                                    type='number'
                                    value={formData.fee}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            fee: Number(e.target.value),
                                        })
                                    }
                                    className='w-full border rounded-lg px-3 py-2 text-sm'
                                />
                            </div>
                            <div className='flex justify-end gap-3 mt-6'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 border rounded-lg text-sm'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm'
                                >
                                    Save
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
