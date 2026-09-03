import { useState, useEffect } from 'react'
import api from '../../api/axios.js'

const LeadModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const defaultFormState = {
        fullName: '',
        email: '',
        phone: '',
        city: '',
        source: '', // We will default this dynamically or leave blank
        status: 'NEW',
        experienceLevel: 'BEGINNER',
        estimatedValue: 0,
        interestedCourses: [],
        nextFollowUpDate: '',
        lostReason: '',
    }

    const [formData, setFormData] = useState(defaultFormState)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [availableCourses, setAvailableCourses] = useState([])
    const [availableSources, setAvailableSources] = useState([]) // New state

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                // Fetch both datasets concurrently
                const [coursesRes, sourcesRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/sources'),
                ])

                setAvailableCourses(coursesRes.data.data || [])

                const fetchedSources = sourcesRes.data.data || []
                setAvailableSources(fetchedSources)

                // If it's a new form, set the default source to the first active one
                if (!initialData && fetchedSources.length > 0) {
                    setFormData((prev) => ({
                        ...prev,
                        source: fetchedSources[0].name,
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch dropdown data:', error)
            }
        }

        if (isOpen) {
            fetchDropdownData()
        }
    }, [isOpen, initialData])

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                nextFollowUpDate: initialData.nextFollowUpDate
                    ? initialData.nextFollowUpDate.split('T')[0]
                    : '',
                interestedCourses:
                    initialData.interestedCourses?.map((course) =>
                        typeof course === 'object' ? course._id : course,
                    ) || [],
                lostReason: initialData.lostReason || '',
            })
        } else {
            // Keep the dynamically fetched default source if it exists
            setFormData((prev) => ({
                ...defaultFormState,
                source: prev.source,
            }))
        }
    }, [initialData, isOpen])

    const handleChange = (e) => {
        const { name, value, type, multiple, selectedOptions } = e.target

        if (multiple) {
            const values = Array.from(selectedOptions, (option) => option.value)
            setFormData((prev) => ({ ...prev, [name]: values }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'number' ? Number(value) : value,
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const payload = { ...formData }

        if (!payload.nextFollowUpDate) delete payload.nextFollowUpDate
        if (payload.status !== 'LOST') payload.lostReason = ''

        await onSubmit(payload)
        setIsSubmitting(false)
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-full overflow-hidden'>
                {/* Fixed Header */}
                <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0'>
                    <h2 className='text-xl font-bold text-gray-800'>
                        {initialData ? 'Edit Lead' : 'Add New Lead'}
                    </h2>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 text-2xl leading-none'
                    >
                        &times;
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className='flex flex-col flex-1 overflow-hidden'
                >
                    {/* Scrollable Form Body */}
                    <div className='p-6 overflow-y-auto flex-1'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/* ... [Keep fullName, phone, email, city inputs exactly the same] ... */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Full Name *
                                </label>
                                <input
                                    required
                                    type='text'
                                    name='fullName'
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Phone Number *
                                </label>
                                <input
                                    required
                                    type='text'
                                    name='phone'
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Email
                                </label>
                                <input
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
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
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            {/* DYNAMIC SOURCE DROPDOWN */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Source
                                </label>
                                <select
                                    name='source'
                                    value={formData.source}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white'
                                >
                                    {availableSources.length === 0 && (
                                        <option value=''>
                                            Loading sources...
                                        </option>
                                    )}
                                    {availableSources.map((sourceOption) => (
                                        <option
                                            key={sourceOption._id}
                                            value={sourceOption.name}
                                        >
                                            {sourceOption.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Status
                                </label>
                                <select
                                    name='status'
                                    value={formData.status}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white'
                                >
                                    <option value='NEW'>New</option>
                                    <option value='CONTACTED'>Contacted</option>
                                    <option value='QUALIFIED'>Qualified</option>
                                    <option value='DEMO_SCHEDULED'>
                                        Demo Scheduled
                                    </option>
                                    <option value='DEMO_ATTENDED'>
                                        Demo Attended
                                    </option>
                                    <option value='ENROLLED'>Enrolled</option>
                                    <option value='LOST'>Lost</option>
                                    <option value='JUNK'>Junk</option>
                                </select>
                            </div>

                            {formData.status === 'LOST' && (
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-medium text-red-700 mb-1'>
                                        Reason for Loss *
                                    </label>
                                    <input
                                        required={formData.status === 'LOST'}
                                        type='text'
                                        name='lostReason'
                                        value={formData.lostReason}
                                        onChange={handleChange}
                                        placeholder='Briefly explain why this lead was lost'
                                        className='w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500 bg-red-50'
                                    />
                                </div>
                            )}

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Experience Level
                                </label>
                                <select
                                    name='experienceLevel'
                                    value={formData.experienceLevel}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white'
                                >
                                    <option value='BEGINNER'>Beginner</option>
                                    <option value='INTERMEDIATE'>
                                        Intermediate
                                    </option>
                                    <option value='ACTIVE_TRADER'>
                                        Active Trader
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Next Follow-Up Date
                                </label>
                                <input
                                    type='date'
                                    name='nextFollowUpDate'
                                    value={formData.nextFollowUpDate || ''}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Estimated Value (₹)
                                </label>
                                <input
                                    type='number'
                                    name='estimatedValue'
                                    value={formData.estimatedValue}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div className='md:col-span-2'>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Interested Courses
                                </label>
                                <select
                                    multiple
                                    name='interestedCourses'
                                    value={formData.interestedCourses}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white'
                                    size={3}
                                >
                                    {availableCourses.map((course) => (
                                        <option
                                            key={course._id}
                                            value={course._id}
                                        >
                                            {course.courseTitle} - ₹{course.fee}
                                        </option>
                                    ))}
                                </select>
                                <p className='text-xs text-gray-400 mt-1'>
                                    Hold Ctrl (Windows) or Cmd (Mac) to select
                                    multiple courses.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className='px-6 py-4 flex justify-end gap-3 border-t border-gray-100 bg-gray-50 shrink-0'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
                        >
                            {isSubmitting ? 'Saving...' : 'Save Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LeadModal
