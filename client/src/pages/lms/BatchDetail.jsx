import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import {
    FiArrowLeft,
    FiUsers,
    FiCheckSquare,
    FiAward,
    FiPlus,
    FiClock,
    FiCalendar,
    FiBookOpen,
    FiCheck,
} from 'react-icons/fi'

const BatchDetail = () => {
    const { batchId } = useParams()
    const navigate = useNavigate()

    const [batch, setBatch] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('sessions')

    // --- SESSION LOG STATE ---
    const [sessions, setSessions] = useState([])
    const [isFetchingSessions, setIsFetchingSessions] = useState(false)
    const [isSessionFormOpen, setIsSessionFormOpen] = useState(false)
    const [isSubmittingSession, setIsSubmittingSession] = useState(false)
    const [sessionForm, setSessionForm] = useState({
        sessionDate: new Date().toISOString().slice(0, 10),
        durationMinutes: 120,
        topicsCovered: '',
        nextSessionPlan: '',
        attendance: [],
    })

    // --- EVALUATIONS (GRADEBOOK) STATE ---
    const [evaluations, setEvaluations] = useState([])
    const [isFetchingEvaluations, setIsFetchingEvaluations] = useState(false)
    const [isEvaluationFormOpen, setIsEvaluationFormOpen] = useState(false)
    const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false)
    const [evaluationForm, setEvaluationForm] = useState({
        examTitle: '',
        examDate: new Date().toISOString().slice(0, 10),
        totalMarks: 100,
        grades: [], // Array of { student, obtainedMarks, grade, facultyRemarks }
    })

    useEffect(() => {
        fetchBatchDetails()
    }, [batchId])

    useEffect(() => {
        if (activeTab === 'sessions') fetchSessions()
        if (activeTab === 'evaluations') fetchEvaluations()
    }, [activeTab, batchId])

    const fetchBatchDetails = async () => {
        try {
            setIsLoading(true)
            const { data } = await api.get(`/batches/${batchId}`)
            setBatch(data.data)
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to load batch details',
            )
        } finally {
            setIsLoading(false)
        }
    }

    // --- SESSION HANDLERS ---
    const fetchSessions = async () => {
        try {
            setIsFetchingSessions(true)
            const { data } = await api.get(`/sessions/batch/${batchId}`)
            setSessions(data.data)
        } catch (err) {
            console.error('Failed to load sessions', err)
        } finally {
            setIsFetchingSessions(false)
        }
    }

    const handleAttendanceToggle = (studentId) => {
        setSessionForm((prev) => {
            const isPresent = prev.attendance.includes(studentId)
            return {
                ...prev,
                attendance: isPresent
                    ? prev.attendance.filter((id) => id !== studentId)
                    : [...prev.attendance, studentId],
            }
        })
    }

    const markAllPresent = () => {
        setSessionForm((prev) => ({
            ...prev,
            attendance: batch.students.map((s) => s._id),
        }))
    }

    const handleSessionSubmit = async (e) => {
        e.preventDefault()
        setIsSubmittingSession(true)
        try {
            await api.post('/sessions', { batchId, ...sessionForm })
            setIsSessionFormOpen(false)
            fetchSessions()
            setSessionForm({
                sessionDate: new Date().toISOString().slice(0, 10),
                durationMinutes: 120,
                topicsCovered: '',
                nextSessionPlan: '',
                attendance: [],
            })
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to log session')
        } finally {
            setIsSubmittingSession(false)
        }
    }

    // --- EVALUATION HANDLERS ---
    const fetchEvaluations = async () => {
        try {
            setIsFetchingEvaluations(true)
            const { data } = await api.get(`/evaluations/batch/${batchId}`)

            // Group evaluations by examTitle for cleaner display
            const grouped = data.data.reduce((acc, curr) => {
                if (!acc[curr.examTitle]) {
                    acc[curr.examTitle] = {
                        examDate: curr.examDate,
                        totalMarks: curr.totalMarks,
                        records: [],
                    }
                }
                acc[curr.examTitle].records.push(curr)
                return acc
            }, {})

            setEvaluations(
                Object.entries(grouped).map(([title, details]) => ({
                    examTitle: title,
                    ...details,
                })),
            )
        } catch (err) {
            console.error('Failed to load evaluations', err)
        } finally {
            setIsFetchingEvaluations(false)
        }
    }

    const openEvaluationForm = () => {
        // Pre-populate the grades array with all students in the batch
        const initialGrades = batch.students.map((s) => ({
            student: s._id,
            studentName: s.fullName, // Kept for UI rendering only
            obtainedMarks: '',
            grade: '',
            facultyRemarks: '',
        }))

        setEvaluationForm({
            examTitle: '',
            examDate: new Date().toISOString().slice(0, 10),
            totalMarks: 100,
            grades: initialGrades,
        })
        setIsEvaluationFormOpen(true)
    }

    const handleGradeChange = (studentId, field, value) => {
        setEvaluationForm((prev) => ({
            ...prev,
            grades: prev.grades.map((g) =>
                g.student === studentId ? { ...g, [field]: value } : g,
            ),
        }))
    }

    const handleEvaluationSubmit = async (e) => {
        e.preventDefault()
        setIsSubmittingEvaluation(true)
        try {
            // Filter out students where no marks were entered
            const validGrades = evaluationForm.grades
                .filter((g) => g.obtainedMarks !== '')
                .map((g) => ({
                    student: g.student,
                    obtainedMarks: Number(g.obtainedMarks),
                    grade: g.grade,
                    facultyRemarks: g.facultyRemarks,
                }))

            if (validGrades.length === 0) {
                alert('Please enter marks for at least one student.')
                setIsSubmittingEvaluation(false)
                return
            }

            await api.post('/evaluations/bulk', {
                batchId,
                examTitle: evaluationForm.examTitle,
                examDate: evaluationForm.examDate,
                totalMarks: evaluationForm.totalMarks,
                grades: validGrades,
            })

            setIsEvaluationFormOpen(false)
            fetchEvaluations()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save evaluations')
        } finally {
            setIsSubmittingEvaluation(false)
        }
    }

    if (isLoading)
        return (
            <div className='p-8 text-center text-gray-500 font-medium'>
                Loading class dashboard...
            </div>
        )
    if (error)
        return (
            <div className='p-8 text-center text-red-600 font-medium'>
                {error}
            </div>
        )
    if (!batch) return null

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <button
                onClick={() => navigate('/batches')}
                className='flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors'
            >
                <FiArrowLeft className='mr-2' /> Back to Batches
            </button>

            <div className='bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden mb-8'>
                <div className='p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-white'>
                    <div className='sm:flex sm:items-center sm:justify-between'>
                        <div>
                            <div className='flex items-center gap-3 mb-2'>
                                <span
                                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${batch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                                >
                                    {batch.status}
                                </span>
                                <span className='text-sm font-medium text-gray-500 flex items-center'>
                                    <FiCalendar className='mr-1' />
                                    Started:{' '}
                                    {new Date(
                                        batch.startDate,
                                    ).toLocaleDateString('en-IN')}
                                </span>
                            </div>
                            <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                                {batch.batchName}
                            </h1>
                            <p className='mt-2 text-sm font-medium text-blue-700 flex items-center'>
                                <FiBookOpen className='mr-2' />{' '}
                                {batch.course?.courseTitle}
                                <span className='mx-2 text-gray-300'>|</span>
                                <FiUsers className='mr-2 text-gray-400' />{' '}
                                Faculty: {batch.faculty?.firstName}{' '}
                                {batch.faculty?.lastName}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='border-t border-gray-200 bg-gray-50 px-6'>
                    <nav className='flex space-x-8' aria-label='Tabs'>
                        <button
                            onClick={() => setActiveTab('sessions')}
                            className={`${activeTab === 'sessions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <FiCheckSquare className='mr-2' /> Session Logs
                        </button>
                        <button
                            onClick={() => setActiveTab('roster')}
                            className={`${activeTab === 'roster' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <FiUsers className='mr-2' /> Enrolled Students (
                            {batch.students?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('evaluations')}
                            className={`${activeTab === 'evaluations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <FiAward className='mr-2' /> Gradebook
                        </button>
                    </nav>
                </div>
            </div>

            <div className='bg-white shadow-sm rounded-xl border border-gray-200 p-6'>
                {/* TAB 1: SESSION LOGS */}
                {activeTab === 'sessions' && (
                    <div>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-lg font-bold text-gray-900'>
                                Class Execution Audit
                            </h2>
                            {!isSessionFormOpen && (
                                <button
                                    onClick={() => setIsSessionFormOpen(true)}
                                    className='flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                                >
                                    <FiPlus className='mr-2' /> Log New Session
                                </button>
                            )}
                        </div>

                        {isSessionFormOpen && (
                            <form
                                onSubmit={handleSessionSubmit}
                                className='bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 animate-fade-in-up'
                            >
                                <h3 className='font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2'>
                                    New Session Details
                                </h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Session Date
                                        </label>
                                        <input
                                            type='date'
                                            required
                                            value={sessionForm.sessionDate}
                                            onChange={(e) =>
                                                setSessionForm({
                                                    ...sessionForm,
                                                    sessionDate: e.target.value,
                                                })
                                            }
                                            className='w-full border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-blue-500'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Duration (Minutes)
                                        </label>
                                        <input
                                            type='number'
                                            required
                                            min='15'
                                            step='15'
                                            value={sessionForm.durationMinutes}
                                            onChange={(e) =>
                                                setSessionForm({
                                                    ...sessionForm,
                                                    durationMinutes:
                                                        e.target.value,
                                                })
                                            }
                                            className='w-full border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-blue-500'
                                        />
                                    </div>
                                </div>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Topics Covered Today
                                    </label>
                                    <textarea
                                        required
                                        rows='3'
                                        value={sessionForm.topicsCovered}
                                        onChange={(e) =>
                                            setSessionForm({
                                                ...sessionForm,
                                                topicsCovered: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-blue-500'
                                    ></textarea>
                                </div>
                                <div className='mb-6'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                        Next Session Plan
                                    </label>
                                    <textarea
                                        rows='2'
                                        value={sessionForm.nextSessionPlan}
                                        onChange={(e) =>
                                            setSessionForm({
                                                ...sessionForm,
                                                nextSessionPlan: e.target.value,
                                            })
                                        }
                                        className='w-full border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-blue-500'
                                    ></textarea>
                                </div>
                                <div className='border-t border-gray-200 pt-4'>
                                    <div className='flex justify-between items-center mb-3'>
                                        <label className='block text-sm font-medium text-gray-700'>
                                            Mark Attendance
                                        </label>
                                        <button
                                            type='button'
                                            onClick={markAllPresent}
                                            className='text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded'
                                        >
                                            Select All Present
                                        </button>
                                    </div>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto'>
                                        {batch.students.map((student) => (
                                            <label
                                                key={student._id}
                                                className='flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-100 transition-colors'
                                            >
                                                <input
                                                    type='checkbox'
                                                    className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer'
                                                    checked={sessionForm.attendance.includes(
                                                        student._id,
                                                    )}
                                                    onChange={() =>
                                                        handleAttendanceToggle(
                                                            student._id,
                                                        )
                                                    }
                                                />
                                                <span className='ml-3 text-sm text-gray-700 font-medium'>
                                                    {student.fullName}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className='mt-6 flex justify-end gap-3'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setIsSessionFormOpen(false)
                                        }
                                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={isSubmittingSession}
                                        className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center'
                                    >
                                        {isSubmittingSession ? (
                                            'Saving...'
                                        ) : (
                                            <>
                                                <FiCheck className='mr-2' />{' '}
                                                Save Session Record
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {isFetchingSessions ? (
                            <div className='text-center py-8 text-gray-500 text-sm'>
                                Loading audit trail...
                            </div>
                        ) : sessions.length === 0 && !isSessionFormOpen ? (
                            <div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
                                <FiClock className='mx-auto h-8 w-8 text-gray-300 mb-3' />
                                <p className='text-gray-500 text-sm'>
                                    No sessions logged for this cohort yet.
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {sessions.map((session, index) => (
                                    <div
                                        key={session._id}
                                        className='bg-white border border-gray-100 shadow-sm rounded-lg p-5 flex flex-col md:flex-row md:items-start gap-4 hover:border-blue-100 transition-colors'
                                    >
                                        <div className='flex-shrink-0 bg-blue-50 text-blue-700 rounded-lg p-3 text-center min-w-[100px]'>
                                            <div className='text-xs uppercase font-bold tracking-wider mb-1'>
                                                Session{' '}
                                                {sessions.length - index}
                                            </div>
                                            <div className='text-lg font-black'>
                                                {new Date(
                                                    session.sessionDate,
                                                ).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                })}
                                            </div>
                                        </div>
                                        <div className='flex-grow'>
                                            <h4 className='text-sm font-bold text-gray-900 mb-1'>
                                                Topics Covered:
                                            </h4>
                                            <p className='text-sm text-gray-600 whitespace-pre-wrap leading-relaxed'>
                                                {session.topicsCovered}
                                            </p>
                                        </div>
                                        <div className='flex-shrink-0 md:text-right flex md:flex-col gap-4 md:gap-2 items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4'>
                                            <div className='text-xs text-gray-500 flex items-center'>
                                                <FiClock className='mr-1' />{' '}
                                                {session.durationMinutes} mins
                                            </div>
                                            <div className='text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded'>
                                                Attendance:{' '}
                                                {session.attendance?.length} /{' '}
                                                {batch.students?.length}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: STUDENT ROSTER */}
                {activeTab === 'roster' && (
                    <div>
                        <h2 className='text-lg font-bold text-gray-900 mb-4'>
                            Class Roster
                        </h2>
                        {batch.students.length === 0 ? (
                            <p className='text-gray-500 text-sm text-center py-8'>
                                No students are currently mapped to this batch.
                            </p>
                        ) : (
                            <div className='overflow-x-auto border border-gray-200 rounded-lg'>
                                <table className='w-full text-left text-sm'>
                                    <thead className='bg-gray-50 text-gray-600 border-b border-gray-200'>
                                        <tr>
                                            <th className='px-4 py-3 font-medium'>
                                                Student Name
                                            </th>
                                            <th className='px-4 py-3 font-medium'>
                                                Email Address
                                            </th>
                                            <th className='px-4 py-3 font-medium'>
                                                Phone Number
                                            </th>
                                            <th className='px-4 py-3 font-medium'>
                                                State
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {batch.students.map((student) => (
                                            <tr
                                                key={student._id}
                                                className='hover:bg-gray-50'
                                            >
                                                <td className='px-4 py-3 font-medium text-gray-900'>
                                                    {student.fullName}
                                                </td>
                                                <td className='px-4 py-3 text-gray-500'>
                                                    {student.email}
                                                </td>
                                                <td className='px-4 py-3 text-gray-500'>
                                                    {student.phone}
                                                </td>
                                                <td className='px-4 py-3'>
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded-full ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                                                    >
                                                        {student.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: GRADEBOOK */}
                {activeTab === 'evaluations' && (
                    <div>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-lg font-bold text-gray-900'>
                                Batch Gradebook
                            </h2>
                            {!isEvaluationFormOpen && (
                                <button
                                    onClick={openEvaluationForm}
                                    className='flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                                >
                                    <FiPlus className='mr-2' /> Log New Exam
                                </button>
                            )}
                        </div>

                        {/* Bulk Grade Entry Form */}
                        {isEvaluationFormOpen && (
                            <form
                                onSubmit={handleEvaluationSubmit}
                                className='bg-white border border-blue-200 shadow-md rounded-xl p-6 mb-8 animate-fade-in-up relative overflow-hidden'
                            >
                                <div className='absolute top-0 left-0 w-full h-1 bg-blue-600'></div>
                                <h3 className='font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2'>
                                    Record Exam Results
                                </h3>

                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Exam Title
                                        </label>
                                        <input
                                            type='text'
                                            required
                                            value={evaluationForm.examTitle}
                                            onChange={(e) =>
                                                setEvaluationForm({
                                                    ...evaluationForm,
                                                    examTitle: e.target.value,
                                                })
                                            }
                                            placeholder='e.g. Mid-Term Evaluation'
                                            className='w-full border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-blue-500'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Date of Exam
                                        </label>
                                        <input
                                            type='date'
                                            required
                                            value={evaluationForm.examDate}
                                            onChange={(e) =>
                                                setEvaluationForm({
                                                    ...evaluationForm,
                                                    examDate: e.target.value,
                                                })
                                            }
                                            className='w-full border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-blue-500'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Total Marks
                                        </label>
                                        <input
                                            type='number'
                                            required
                                            min='1'
                                            value={evaluationForm.totalMarks}
                                            onChange={(e) =>
                                                setEvaluationForm({
                                                    ...evaluationForm,
                                                    totalMarks: e.target.value,
                                                })
                                            }
                                            className='w-full border border-gray-300 px-3 py-2 rounded-lg outline-none focus:border-blue-500'
                                        />
                                    </div>
                                </div>

                                <div className='overflow-x-auto border border-gray-200 rounded-lg'>
                                    <table className='w-full text-left text-sm'>
                                        <thead className='bg-gray-50 text-gray-600 border-b border-gray-200'>
                                            <tr>
                                                <th className='px-4 py-3 font-medium'>
                                                    Student Name
                                                </th>
                                                <th className='px-4 py-3 font-medium w-32'>
                                                    Marks Obtained
                                                </th>
                                                <th className='px-4 py-3 font-medium w-24'>
                                                    Grade
                                                </th>
                                                <th className='px-4 py-3 font-medium'>
                                                    Faculty Remarks
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {evaluationForm.grades.map(
                                                (grade) => (
                                                    <tr
                                                        key={grade.student}
                                                        className='hover:bg-gray-50'
                                                    >
                                                        <td className='px-4 py-2 font-medium text-gray-900'>
                                                            {grade.studentName}
                                                        </td>
                                                        <td className='px-4 py-2'>
                                                            <input
                                                                type='number'
                                                                min='0'
                                                                max={
                                                                    evaluationForm.totalMarks
                                                                }
                                                                value={
                                                                    grade.obtainedMarks
                                                                }
                                                                onChange={(e) =>
                                                                    handleGradeChange(
                                                                        grade.student,
                                                                        'obtainedMarks',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className='w-full border border-gray-300 px-2 py-1 rounded outline-none focus:border-blue-500'
                                                                placeholder='0'
                                                            />
                                                        </td>
                                                        <td className='px-4 py-2'>
                                                            <input
                                                                type='text'
                                                                value={
                                                                    grade.grade
                                                                }
                                                                onChange={(e) =>
                                                                    handleGradeChange(
                                                                        grade.student,
                                                                        'grade',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className='w-full border border-gray-300 px-2 py-1 rounded outline-none focus:border-blue-500 uppercase'
                                                                placeholder='A, B+, etc.'
                                                                maxLength='5'
                                                            />
                                                        </td>
                                                        <td className='px-4 py-2'>
                                                            <input
                                                                type='text'
                                                                value={
                                                                    grade.facultyRemarks
                                                                }
                                                                onChange={(e) =>
                                                                    handleGradeChange(
                                                                        grade.student,
                                                                        'facultyRemarks',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className='w-full border border-gray-300 px-2 py-1 rounded outline-none focus:border-blue-500'
                                                                placeholder='Optional notes...'
                                                            />
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='mt-6 flex justify-end gap-3'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setIsEvaluationFormOpen(false)
                                        }
                                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={isSubmittingEvaluation}
                                        className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center'
                                    >
                                        {isSubmittingEvaluation ? (
                                            'Saving...'
                                        ) : (
                                            <>
                                                <FiAward className='mr-2' />{' '}
                                                Submit All Grades
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Past Evaluations Display */}
                        {isFetchingEvaluations ? (
                            <div className='text-center py-8 text-gray-500 text-sm'>
                                Loading gradebook...
                            </div>
                        ) : evaluations.length === 0 &&
                          !isEvaluationFormOpen ? (
                            <div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
                                <FiAward className='mx-auto h-8 w-8 text-gray-300 mb-3' />
                                <p className='text-gray-500 text-sm'>
                                    No exams have been recorded for this cohort
                                    yet.
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-8'>
                                {evaluations.map((exam, idx) => (
                                    <div
                                        key={idx}
                                        className='bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden'
                                    >
                                        <div className='bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                                            <div>
                                                <h3 className='font-bold text-gray-900'>
                                                    {exam.examTitle}
                                                </h3>
                                                <p className='text-xs text-gray-500 flex items-center mt-1'>
                                                    <FiCalendar className='mr-1' />{' '}
                                                    {new Date(
                                                        exam.examDate,
                                                    ).toLocaleDateString(
                                                        'en-IN',
                                                    )}
                                                </p>
                                            </div>
                                            <div className='text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 w-fit'>
                                                Total Marks: {exam.totalMarks}
                                            </div>
                                        </div>
                                        <div className='overflow-x-auto'>
                                            <table className='w-full text-left text-sm'>
                                                <thead className='bg-white text-gray-500 border-b border-gray-100'>
                                                    <tr>
                                                        <th className='px-4 py-3 font-medium'>
                                                            Student Name
                                                        </th>
                                                        <th className='px-4 py-3 font-medium'>
                                                            Score
                                                        </th>
                                                        <th className='px-4 py-3 font-medium'>
                                                            Grade
                                                        </th>
                                                        <th className='px-4 py-3 font-medium'>
                                                            Remarks
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y divide-gray-50'>
                                                    {exam.records.map(
                                                        (record) => (
                                                            <tr
                                                                key={record._id}
                                                                className='hover:bg-gray-50'
                                                            >
                                                                <td className='px-4 py-3 font-medium text-gray-900'>
                                                                    {record
                                                                        .student
                                                                        ?.fullName ||
                                                                        'Unknown Student'}
                                                                </td>
                                                                <td className='px-4 py-3 font-bold text-gray-700'>
                                                                    {
                                                                        record.obtainedMarks
                                                                    }{' '}
                                                                    <span className='text-gray-400 font-normal text-xs'>
                                                                        /{' '}
                                                                        {
                                                                            exam.totalMarks
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className='px-4 py-3'>
                                                                    <span className='px-2 py-0.5 bg-gray-100 text-gray-700 font-bold text-xs rounded'>
                                                                        {record.grade ||
                                                                            '-'}
                                                                    </span>
                                                                </td>
                                                                <td className='px-4 py-3 text-gray-600 italic text-xs'>
                                                                    {record.facultyRemarks ||
                                                                        '-'}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BatchDetail
