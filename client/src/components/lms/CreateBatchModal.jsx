import { useState, useEffect } from 'react'
import axios from 'axios'
import { FiX } from 'react-icons/fi'

const CreateBatchModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        batchName: '',
        course: '',
        faculty: '',
        startDate: '',
        endDate: '',
    })
    const [courses, setCourses] = useState([])
    const [faculties, setFaculties] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingOptions, setIsFetchingOptions] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchOptions()
            setFormData({
                batchName: '',
                course: '',
                faculty: '',
                startDate: '',
                endDate: '',
            })
            setError(null)
        }
    }, [isOpen])

    const fetchOptions = async () => {
        try {
            setIsFetchingOptions(true)
            const [courseRes, userRes] = await Promise.all([
                axios.get('/api/courses', { withCredentials: true }),
                axios.get('/api/users', { withCredentials: true }),
            ])

            setCourses(courseRes.data.data || courseRes.data)

            // Filter users to isolate only Faculty members
            const allUsers = userRes.data.data || userRes.data
            const facultyList = allUsers.filter(
                (user) =>
                    (user.role?.name || user.role || '').toLowerCase() ===
                    'faculty',
            )
            setFaculties(facultyList)
        } catch (err) {
            setError('Failed to load prerequisite data. Please try again.')
        } finally {
            setIsFetchingOptions(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            await axios.post('/api/batches', formData, {
                withCredentials: true,
            })
            onSuccess() // Triggers the parent component to refresh the list and close the modal
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create batch')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden'>
                <div className='flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50'>
                    <h3 className='text-lg font-bold text-gray-900'>
                        Create New Batch
                    </h3>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors'
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <div className='p-6'>
                    {error && (
                        <div className='bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100'>
                            {error}
                        </div>
                    )}

                    {isFetchingOptions ? (
                        <div className='flex justify-center items-center h-32'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Batch Name
                                </label>
                                <input
                                    type='text'
                                    name='batchName'
                                    required
                                    value={formData.batchName}
                                    onChange={handleChange}
                                    placeholder='e.g., Equity Options - Weekend Oct 2026'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none'
                                />
                            </div>

                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Course
                                    </label>
                                    <select
                                        name='course'
                                        required
                                        value={formData.course}
                                        onChange={handleChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none bg-white'
                                    >
                                        <option value=''>
                                            Select Course...
                                        </option>
                                        {courses.map((course) => (
                                            <option
                                                key={course._id}
                                                value={course._id}
                                            >
                                                {course.courseTitle}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Assigned Faculty
                                    </label>
                                    <select
                                        name='faculty'
                                        required
                                        value={formData.faculty}
                                        onChange={handleChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none bg-white'
                                    >
                                        <option value=''>
                                            Select Faculty...
                                        </option>
                                        {faculties.map((faculty) => (
                                            <option
                                                key={faculty._id}
                                                value={faculty._id}
                                            >
                                                {faculty.firstName}{' '}
                                                {faculty.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Start Date
                                    </label>
                                    <input
                                        type='date'
                                        name='startDate'
                                        required
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        End Date{' '}
                                        <span className='text-gray-400 font-normal'>
                                            (Optional)
                                        </span>
                                    </label>
                                    <input
                                        type='date'
                                        name='endDate'
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    />
                                </div>
                            </div>

                            <div className='mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100'>
                                <button
                                    type='button'
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isLoading}
                                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors inline-flex items-center'
                                >
                                    {isLoading ? 'Creating...' : 'Create Batch'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateBatchModal
