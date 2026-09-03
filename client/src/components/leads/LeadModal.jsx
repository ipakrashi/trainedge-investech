import { useState, useEffect } from 'react'
import api from '../../api/axios.js'

const defaultFormState = {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    source: '',
    status: '',
    experienceLevel: '',
    estimatedValue: 0,
    interestedCourses: [],
    assignedTo: '',
    nextFollowUpDate: '',
    lostReason: '',
}

const LeadModal = ({ isOpen, onClose, onSubmit, initialData, currentUser }) => {
    const [formData, setFormData] = useState(defaultFormState)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [availableCourses, setAvailableCourses] = useState([])
    const [availableSources, setAvailableSources] = useState([])
    const [availableStatuses, setAvailableStatuses] = useState([])
    const [availableExperiences, setAvailableExperiences] = useState([])
    const [availableUsers, setAvailableUsers] = useState([])

    // Determine Admin status
    const roleName = (
        currentUser?.role?.name ||
        currentUser?.role ||
        ''
    ).toLowerCase()
    const isAdmin = roleName === 'admin'

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const requests = [
                    api.get('/courses'),
                    api.get('/sources'),
                    api.get('/statuses'),
                    api.get('/experiences'),
                ]
                if (isAdmin) {
                    requests.push(api.get('/users'))
                }

                const responses = await Promise.all(requests)

                const courses = responses[0]?.data?.data || []
                const sources = responses[1]?.data?.data || []
                const statuses = responses[2]?.data?.data || []
                const experiences = responses[3]?.data?.data || []
                const users = isAdmin
                    ? responses[4]?.data?.data || responses[4]?.data || []
                    : []

                setAvailableCourses(courses)
                setAvailableSources(sources)
                setAvailableStatuses(statuses)
                setAvailableExperiences(experiences)
                if (isAdmin) setAvailableUsers(users)

                if (!initialData) {
                    setFormData((prev) => ({
                        ...prev,
                        source: prev.source || sources[0]?.name || '',
                        status: prev.status || statuses[0]?.name || '',
                        experienceLevel:
                            prev.experienceLevel || experiences[0]?.name || '',
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch dropdown datasets:', error)
            }
        }

        if (isOpen) fetchDropdownData()
    }, [isOpen, isAdmin, initialData])

    useEffect(() => {
        if (!isOpen) return

        if (initialData) {
            setFormData({
                ...defaultFormState,
                ...initialData,
                assignedTo:
                    typeof initialData.assignedTo === 'object'
                        ? initialData.assignedTo?._id || ''
                        : initialData.assignedTo || '',
                nextFollowUpDate: initialData.nextFollowUpDate
                    ? initialData.nextFollowUpDate.split('T')[0]
                    : '',
                interestedCourses:
                    initialData.interestedCourses?.map((course) =>
                        typeof course === 'object' ? course._id : course,
                    ) || [],
                lostReason: initialData.lostReason || '',
                estimatedValue: Number(initialData.estimatedValue) || 0,
            })
        } else {
            setFormData({
                ...defaultFormState,
                source: availableSources[0]?.name || '',
                status: availableStatuses[0]?.name || '',
                experienceLevel: availableExperiences[0]?.name || '',
                assignedTo: currentUser?._id || '',
            })
        }
    }, [
        isOpen,
        initialData,
        availableSources,
        availableStatuses,
        availableExperiences,
        currentUser,
    ])

    const handleChange = (e) => {
        const { name, value, type, multiple, selectedOptions } = e.target

        if (multiple) {
            const values = Array.from(selectedOptions, (opt) => opt.value)
            setFormData((prev) => ({ ...prev, [name]: values }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]:
                    type === 'number'
                        ? value === ''
                            ? ''
                            : Number(value)
                        : value,
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const payload = { ...formData }
        payload.estimatedValue = Number(payload.estimatedValue) || 0

        if (!payload.nextFollowUpDate) delete payload.nextFollowUpDate
        if (payload.status !== 'LOST') payload.lostReason = ''
        if (!payload.assignedTo) delete payload.assignedTo

        try {
            await onSubmit(payload)
        } catch (error) {
            console.error('Form submission failed:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-full overflow-hidden'>
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
                    <div className='p-6 overflow-y-auto flex-1'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                                    {availableSources.map((s) => (
                                        <option key={s._id} value={s.name}>
                                            {s.label || s.name}
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
                                    {availableStatuses.map((s) => (
                                        <option key={s._id} value={s.name}>
                                            {s.label || s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.status === 'LOST' && (
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-medium text-red-700 mb-1'>
                                        Reason for Loss *
                                    </label>
                                    <input
                                        required
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
                                    {availableExperiences.map((e) => (
                                        <option key={e._id} value={e.name}>
                                            {e.label || e.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ADMIN EXCLUSIVE: Assign Lead To */}
                            {isAdmin && (
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Assign Lead To
                                    </label>
                                    <select
                                        name='assignedTo'
                                        value={formData.assignedTo}
                                        onChange={handleChange}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white'
                                    >
                                        <option value={currentUser?._id || ''}>
                                            Assign to Me (Default)
                                        </option>
                                        {availableUsers.map((u) => (
                                            <option key={u._id} value={u._id}>
                                                {u.firstName} {u.lastName} (
                                                {u.role?.name ||
                                                    u.role ||
                                                    'Staff'}
                                                )
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
