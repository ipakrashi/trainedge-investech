import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import {
    FiBookOpen,
    FiUser,
    FiCheckCircle,
    FiEdit,
    FiFileText,
    FiAward,
    FiX,
    FiLayers,
    FiSearch,
    FiFilter,
} from 'react-icons/fi'

const StudentRoster = () => {
    const [students, setStudents] = useState([])
    const [batches, setBatches] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Filter States
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCourse, setFilterCourse] = useState('')
    const [filterBatch, setFilterBatch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    // Selection State for Bulk Actions
    const [selectedStudentIds, setSelectedStudentIds] = useState([])

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        pincode: '',
        studentAgreementLink: '',
        certificateLink: '',
        status: '',
        batchToAssign: '',
    })

    // Batch Assignment Modal State
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState('')
    const [isAssigning, setIsAssigning] = useState(false)

    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null
    const roleName = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()
    const isAdmin = roleName === 'admin'

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [studentsRes, batchesRes] = await Promise.all([
                api.get('/students'),
                api.get('/batches'),
            ])

            const allStudents = studentsRes.data?.data || []
            setStudents(
                allStudents.filter((s) => s.status !== 'PENDING_ASSIGNMENT'),
            )
            setBatches(batchesRes.data?.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // --- DERIVED DATA & FILTERING ---
    // Helper to find which batches a student is in
    const getStudentBatches = (studentId) => {
        return batches.filter((b) =>
            b.students?.some((sId) => sId.toString() === studentId.toString()),
        )
    }

    // Extract unique courses dynamically for the filter dropdown
    const availableCourses = useMemo(() => {
        const map = new Map()
        students.forEach((s) => {
            s.enrolledCourses?.forEach((c) => {
                if (!map.has(c._id)) map.set(c._id, c.courseTitle)
            })
        })
        return Array.from(map, ([id, title]) => ({ id, title }))
    }, [students])

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                student.fullName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                student.email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                student.phone.includes(searchTerm)

            const matchesCourse = filterCourse
                ? student.enrolledCourses?.some((c) => c._id === filterCourse)
                : true

            const studentBatches = getStudentBatches(student._id)
            const matchesBatch = filterBatch
                ? studentBatches.some((b) => b._id === filterBatch)
                : true

            const matchesStatus = filterStatus
                ? student.status === filterStatus
                : true

            return (
                matchesSearch && matchesCourse && matchesBatch && matchesStatus
            )
        })
    }, [students, batches, searchTerm, filterCourse, filterBatch, filterStatus])

    // --- SELECTION HANDLERS ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudentIds(filteredStudents.map((s) => s._id))
        } else {
            setSelectedStudentIds([])
        }
    }

    const handleSelectStudent = (studentId) => {
        setSelectedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId],
        )
    }

    // --- BATCH ASSIGNMENT HANDLERS (Bulk) ---
    const handleAssignToBatch = async (e) => {
        e.preventDefault()
        if (!selectedBatch) return alert('Please select a batch')
        if (selectedStudentIds.length === 0)
            return alert('No students selected')

        setIsAssigning(true)
        try {
            const res = await api.put(`/batches/${selectedBatch}/students`, {
                studentIds: selectedStudentIds,
            })

            if (res.data.success) {
                alert(
                    `Successfully assigned ${selectedStudentIds.length} students to the batch!`,
                )
                setSelectedStudentIds([])
                setIsBatchModalOpen(false)
                setSelectedBatch('')
                fetchData()
            }
        } catch (error) {
            console.error('Failed to assign students to batch:', error)
            alert(
                error.response?.data?.message ||
                    'Failed to assign students to batch',
            )
        } finally {
            setIsAssigning(false)
        }
    }

    // --- EDIT MODAL HANDLERS ---
    const handleEditClick = (student) => {
        setSelectedStudent(student)
        setFormData({
            address: student.address || '',
            city: student.city || '',
            pincode: student.pincode || '',
            studentAgreementLink: student.studentAgreementLink || '',
            certificateLink: student.certificateLink || '',
            status: student.status || 'ACTIVE',
            batchToAssign: '',
        })
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
        setSelectedStudent(null)
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await api.put(`/students/${selectedStudent._id}`, {
                address: formData.address,
                city: formData.city,
                pincode: formData.pincode,
                studentAgreementLink: formData.studentAgreementLink,
                certificateLink: formData.certificateLink,
                status: formData.status,
            })

            if (formData.batchToAssign) {
                await api.put(`/batches/${formData.batchToAssign}/students`, {
                    studentIds: [selectedStudent._id],
                })
            }

            if (res.data.success) {
                fetchData()
                handleCloseEditModal()
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
        <div className='bg-gray-50 min-h-screen py-8 relative'>
            <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header & Bulk Action Bar */}
                <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Student Roster
                        </h1>
                        <p className='text-sm text-gray-500 mt-1'>
                            {isAdmin
                                ? 'Global overview of all active students and cohort assignments.'
                                : 'Your active students and delivery roster.'}
                        </p>
                    </div>

                    {/* Bulk Action Button */}
                    {isAdmin && selectedStudentIds.length > 0 && (
                        <div className='mt-4 sm:mt-0 flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 animate-fade-in-up'>
                            <span className='text-sm font-medium text-blue-800 mr-4'>
                                {selectedStudentIds.length} selected
                            </span>
                            <button
                                onClick={() => setIsBatchModalOpen(true)}
                                className='inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                            >
                                <FiLayers className='mr-2' /> Assign to Batch
                            </button>
                        </div>
                    )}
                </div>

                {/* Powerful Filtering Engine */}
                <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <FiSearch className='text-gray-400' />
                        </div>
                        <input
                            type='text'
                            placeholder='Search name, email, or phone...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm outline-none'
                        />
                    </div>

                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <FiFilter className='text-gray-400' />
                        </div>
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className='w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm outline-none appearance-none bg-white'
                        >
                            <option value=''>All Courses</option>
                            {availableCourses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <FiLayers className='text-gray-400' />
                        </div>
                        <select
                            value={filterBatch}
                            onChange={(e) => setFilterBatch(e.target.value)}
                            className='w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm outline-none appearance-none bg-white'
                        >
                            <option value=''>All Batches</option>
                            {batches.map((b) => (
                                <option key={b._id} value={b._id}>
                                    {b.batchName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='relative'>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm outline-none bg-white'
                        >
                            <option value=''>All Statuses</option>
                            <option value='ACTIVE'>Active</option>
                            <option value='GRADUATED'>Graduated</option>
                            <option value='DROPPED'>Dropped</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                    {isAdmin && (
                                        <th className='px-6 py-4 font-medium w-12'>
                                            <input
                                                type='checkbox'
                                                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer'
                                                onChange={handleSelectAll}
                                                checked={
                                                    selectedStudentIds.length ===
                                                        filteredStudents.length &&
                                                    filteredStudents.length > 0
                                                }
                                            />
                                        </th>
                                    )}
                                    <th className='px-6 py-4 font-medium'>
                                        Student
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Contact
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Courses
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Cohort / Batch
                                    </th>
                                    {isAdmin && (
                                        <th className='px-6 py-4 font-medium'>
                                            Faculty
                                        </th>
                                    )}
                                    <th className='px-6 py-4 font-medium'>
                                        State
                                    </th>
                                    <th className='px-6 py-4 font-medium text-right'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {filteredStudents.map((student) => {
                                    const studentBatches = getStudentBatches(
                                        student._id,
                                    )

                                    return (
                                        <tr
                                            key={student._id}
                                            className={`hover:bg-gray-50 ${selectedStudentIds.includes(student._id) ? 'bg-blue-50/50' : ''}`}
                                        >
                                            {isAdmin && (
                                                <td className='px-6 py-4'>
                                                    <input
                                                        type='checkbox'
                                                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer'
                                                        checked={selectedStudentIds.includes(
                                                            student._id,
                                                        )}
                                                        onChange={() =>
                                                            handleSelectStudent(
                                                                student._id,
                                                            )
                                                        }
                                                    />
                                                </td>
                                            )}
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
                                                                {
                                                                    course.courseTitle
                                                                }
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='flex flex-col gap-1'>
                                                    {studentBatches.length >
                                                    0 ? (
                                                        studentBatches.map(
                                                            (b) => (
                                                                <span
                                                                    key={b._id}
                                                                    className='inline-flex items-center bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium w-fit'
                                                                >
                                                                    {
                                                                        b.batchName
                                                                    }
                                                                </span>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className='text-gray-400 text-xs italic'>
                                                            Unassigned
                                                        </span>
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
                                                <span
                                                    className={`flex items-center text-xs font-medium w-fit ${student.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}
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
                                                    {student.studentAgreementLink ? (
                                                        <a
                                                            href={
                                                                student.studentAgreementLink
                                                            }
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            title='View Student Agreement'
                                                            className='text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 rounded-md transition-colors'
                                                        >
                                                            <FiFileText
                                                                size={16}
                                                            />
                                                        </a>
                                                    ) : (
                                                        <div
                                                            title='No Student Agreement Uploaded'
                                                            className='text-gray-300 p-1.5 bg-gray-50 rounded-md cursor-not-allowed'
                                                        >
                                                            <FiFileText
                                                                size={16}
                                                            />
                                                        </div>
                                                    )}
                                                    {student.certificateLink ? (
                                                        <a
                                                            href={
                                                                student.certificateLink
                                                            }
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            title='View Course Certificate'
                                                            className='text-amber-500 hover:text-amber-700 p-1.5 bg-amber-50 rounded-md transition-colors'
                                                        >
                                                            <FiAward
                                                                size={16}
                                                            />
                                                        </a>
                                                    ) : (
                                                        <div
                                                            title='No Course Certificate Uploaded'
                                                            className='text-gray-300 p-1.5 bg-gray-50 rounded-md cursor-not-allowed'
                                                        >
                                                            <FiAward
                                                                size={16}
                                                            />
                                                        </div>
                                                    )}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    student,
                                                                )
                                                            }
                                                            title='Edit Student Details'
                                                            className='text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-1.5 bg-gray-100 rounded-md transition-colors'
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={isAdmin ? 8 : 7}
                                            className='px-6 py-12 text-center text-gray-500'
                                        >
                                            No students match the selected
                                            filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL 1: BATCH ASSIGNMENT (Bulk) --- */}
            {isBatchModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden'>
                        <div className='flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50'>
                            <h2 className='text-lg font-bold text-gray-900'>
                                Assign to Batch
                            </h2>
                            <button
                                onClick={() => setIsBatchModalOpen(false)}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAssignToBatch} className='p-6'>
                            <p className='text-sm text-gray-600 mb-4'>
                                You are about to assign{' '}
                                <span className='font-bold text-blue-600'>
                                    {selectedStudentIds.length} student(s)
                                </span>{' '}
                                to a cohort.
                            </p>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Select Active Batch
                            </label>
                            <select
                                required
                                value={selectedBatch}
                                onChange={(e) =>
                                    setSelectedBatch(e.target.value)
                                }
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white'
                            >
                                <option value=''>-- Choose a Batch --</option>
                                {batches
                                    .filter((b) => b.status !== 'COMPLETED')
                                    .map((batch) => (
                                        <option
                                            key={batch._id}
                                            value={batch._id}
                                        >
                                            {batch.batchName} ({batch.status})
                                        </option>
                                    ))}
                            </select>

                            <div className='flex justify-end gap-3 pt-6 mt-2'>
                                <button
                                    type='button'
                                    onClick={() => setIsBatchModalOpen(false)}
                                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isAssigning || !selectedBatch}
                                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                                >
                                    {isAssigning
                                        ? 'Assigning...'
                                        : 'Confirm Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: INDIVIDUAL STUDENT CRM EDIT --- */}
            {isEditModalOpen && isAdmin && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden'>
                        <div className='flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0'>
                            <h2 className='text-xl font-bold text-gray-900'>
                                Edit Student Details
                            </h2>
                            <button
                                onClick={handleCloseEditModal}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleEditSubmit}
                            className='flex flex-col min-h-0'
                        >
                            <div className='p-6 space-y-4 overflow-y-auto flex-1'>
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
                                        <option value='GRADUATED'>
                                            GRADUATED
                                        </option>
                                        <option value='DROPPED'>DROPPED</option>
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Assign to Cohort / Batch
                                    </label>
                                    <select
                                        name='batchToAssign'
                                        value={formData.batchToAssign}
                                        onChange={handleChange}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white'
                                    >
                                        <option value=''>
                                            -- Leave Unchanged / Unassigned --
                                        </option>
                                        {batches
                                            .filter(
                                                (b) => b.status !== 'COMPLETED',
                                            )
                                            .map((batch) => (
                                                <option
                                                    key={batch._id}
                                                    value={batch._id}
                                                >
                                                    {batch.batchName} (
                                                    {batch.status})
                                                </option>
                                            ))}
                                    </select>
                                    <p className='text-xs text-gray-500 mt-1'>
                                        Select a batch to override or establish
                                        a new cohort assignment for this
                                        student.
                                    </p>
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

                                <div className='space-y-4 pt-4 border-t border-gray-100'>
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
                            </div>

                            <div className='flex justify-end gap-3 p-6 border-t border-gray-100 bg-white shrink-0'>
                                <button
                                    type='button'
                                    onClick={handleCloseEditModal}
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
