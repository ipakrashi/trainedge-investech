import { useState, useEffect } from 'react'
import axios from 'axios'
import { FiPlus, FiAward, FiClock, FiX, FiSliders } from 'react-icons/fi'

const ExamManagement = () => {
    const [exams, setExams] = useState([])
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const defaultGradingScale = [
        { grade: 'A+', minPercentage: 90 },
        { grade: 'A', minPercentage: 80 },
        { grade: 'B', minPercentage: 65 },
        { grade: 'C', minPercentage: 50 },
        { grade: 'F', minPercentage: 0 },
    ]

    const [form, setForm] = useState({
        title: '',
        description: '',
        course: '',
        totalMarks: 100,
        passingMarks: 40,
        durationMinutes: 60,
        gradingScale: defaultGradingScale,
    })

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            setIsLoading(true)
            const [examsRes, coursesRes] = await Promise.all([
                axios.get('/api/exams', { withCredentials: true }),
                axios.get('/api/courses', { withCredentials: true }),
            ])
            setExams(examsRes.data.data || [])
            setCourses(coursesRes.data.data || coursesRes.data || [])
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to fetch exam records',
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleScaleThresholdChange = (index, value) => {
        const updated = [...form.gradingScale]
        updated[index] = {
            ...updated[index],
            minPercentage: Number(value),
        }
        setForm({ ...form, gradingScale: updated })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        try {
            await axios.post('/api/exams', form, { withCredentials: true })
            setIsModalOpen(false)
            setForm({
                title: '',
                description: '',
                course: '',
                totalMarks: 100,
                passingMarks: 40,
                durationMinutes: 60,
                gradingScale: defaultGradingScale,
            })
            fetchInitialData()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create exam')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='sm:flex sm:items-center sm:justify-between mb-8'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Exam Master Blueprint
                    </h1>
                    <p className='mt-2 text-sm text-gray-600'>
                        Configure standardized assessments, question blueprints,
                        and automated grading curves per course.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
                >
                    <FiPlus className='-ml-1 mr-2 h-5 w-5' />
                    Create Exam
                </button>
            </div>

            {error && (
                <div className='bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 mb-6'>
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className='flex justify-center items-center h-64'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                </div>
            ) : exams.length === 0 ? (
                <div className='text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12'>
                    <FiAward className='mx-auto h-12 w-12 text-gray-300' />
                    <h3 className='mt-2 text-sm font-medium text-gray-900'>
                        No Exams Defined
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                        Create an exam definition so faculties can grade cohorts
                        using standardized templates.
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {exams.map((exam) => (
                        <div
                            key={exam._id}
                            className='bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:border-blue-300 transition-all'
                        >
                            <div>
                                <div className='flex justify-between items-start mb-2'>
                                    <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100'>
                                        {exam.course?.courseTitle || 'General'}
                                    </span>
                                    <span className='text-xs text-gray-400 flex items-center'>
                                        <FiClock className='mr-1' />{' '}
                                        {exam.durationMinutes} mins
                                    </span>
                                </div>
                                <h3 className='text-lg font-bold text-gray-900 mt-2'>
                                    {exam.title}
                                </h3>
                                {exam.description && (
                                    <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                                        {exam.description}
                                    </p>
                                )}

                                {/* Grading curve preview chips */}
                                <div className='mt-4 pt-3 border-t border-gray-100'>
                                    <span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2'>
                                        Grading Scale Thresholds
                                    </span>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {(
                                            exam.gradingScale ||
                                            defaultGradingScale
                                        ).map((tier) => (
                                            <span
                                                key={tier.grade}
                                                className='px-2 py-0.5 rounded text-xs bg-gray-50 border border-gray-200 text-gray-700 font-medium'
                                            >
                                                <strong>{tier.grade}</strong>: ≥
                                                {tier.minPercentage}%
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className='border-t border-gray-100 pt-4 mt-4 flex justify-between text-sm'>
                                <span className='text-gray-600 font-medium'>
                                    Total:{' '}
                                    <strong className='text-gray-900'>
                                        {exam.totalMarks}
                                    </strong>
                                </span>
                                <span className='text-gray-600 font-medium'>
                                    Pass Mark:{' '}
                                    <strong className='text-gray-900'>
                                        {exam.passingMarks}
                                    </strong>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE EXAM MODAL */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm'>
                    <div className='bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden'>
                        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50'>
                            <h3 className='text-lg font-bold text-gray-900'>
                                Define New Exam Blueprint
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='text-gray-400 hover:text-gray-600'
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className='p-6 space-y-4 max-h-[80vh] overflow-y-auto'
                        >
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Exam Title
                                </label>
                                <input
                                    type='text'
                                    name='title'
                                    required
                                    placeholder='e.g., OTT-Phase I'
                                    value={form.title}
                                    onChange={handleChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Associated Course
                                </label>
                                <select
                                    name='course'
                                    required
                                    value={form.course}
                                    onChange={handleChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white'
                                >
                                    <option value=''>Select Course...</option>
                                    {courses.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.courseTitle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='grid grid-cols-3 gap-3'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                        Total Marks
                                    </label>
                                    <input
                                        type='number'
                                        name='totalMarks'
                                        required
                                        min='1'
                                        value={form.totalMarks}
                                        onChange={handleChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                        Passing Marks
                                    </label>
                                    <input
                                        type='number'
                                        name='passingMarks'
                                        required
                                        min='0'
                                        value={form.passingMarks}
                                        onChange={handleChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                                        Duration (Min)
                                    </label>
                                    <input
                                        type='number'
                                        name='durationMinutes'
                                        required
                                        min='10'
                                        value={form.durationMinutes}
                                        onChange={handleChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500'
                                    />
                                </div>
                            </div>

                            {/* Automated Grading Scale Section */}
                            <div>
                                <label className='block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5'>
                                    <FiSliders className='text-blue-600' />
                                    Automated Grading Scale (% Minimum Cutoffs)
                                </label>
                                <div className='grid grid-cols-5 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200'>
                                    {form.gradingScale.map((tier, idx) => (
                                        <div
                                            key={tier.grade}
                                            className='text-center'
                                        >
                                            <span className='block text-xs font-bold text-gray-700 mb-1'>
                                                {tier.grade}
                                            </span>
                                            <div className='relative'>
                                                <input
                                                    type='number'
                                                    min='0'
                                                    max='100'
                                                    disabled={
                                                        tier.grade === 'F'
                                                    }
                                                    value={tier.minPercentage}
                                                    onChange={(e) =>
                                                        handleScaleThresholdChange(
                                                            idx,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className='w-full text-center py-1 border border-gray-300 rounded text-xs bg-white outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400'
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className='text-[11px] text-gray-400 mt-1'>
                                    Faculty enters marks; grade badges calculate
                                    automatically based on these thresholds.
                                </p>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Description / Instructions
                                </label>
                                <textarea
                                    name='description'
                                    rows='3'
                                    placeholder='Syllabus coverage or specific instructions...'
                                    value={form.description}
                                    onChange={handleChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500'
                                />
                            </div>

                            <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isSubmitting}
                                    className='px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : 'Save Exam Master'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ExamManagement
