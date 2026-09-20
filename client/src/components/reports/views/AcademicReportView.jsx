// src/components/reports/views/AcademicReportView.jsx
import {
    FiLayers,
    FiAward,
    FiBook,
    FiCheckCircle,
    FiCalendar,
} from 'react-icons/fi'
import StatCard from '../../common/StatCard'

const AcademicReportView = ({
    batches = [],
    selectedBatchId,
    onSelectBatchId,
    academicReportData,
    isLoading,
}) => {
    const getGradeBadgeStyle = (grade) => {
        switch (grade) {
            case 'A+':
            case 'A':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'B':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'C':
                return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'F':
                return 'bg-red-100 text-red-700 border-red-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className='space-y-6'>
            {/* Batch Selector Bar */}
            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                <label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                    <FiLayers className='text-blue-600 flex-shrink-0' />
                    <span>Select Cohort / Batch:</span>
                </label>
                <select
                    value={selectedBatchId}
                    onChange={(e) => onSelectBatchId(e.target.value)}
                    className='border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white sm:bg-gray-50 w-full sm:max-w-xs outline-none'
                >
                    {batches.map((b) => (
                        <option key={b._id} value={b._id}>
                            {b.batchName} ({b.status})
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className='text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3'></div>
                    <p className='text-sm text-gray-500 font-medium'>
                        Compiling academic assessment reports...
                    </p>
                </div>
            ) : !academicReportData || !academicReportData.data?.length ? (
                <div className='text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 text-sm'>
                    <FiAward className='mx-auto h-10 w-10 text-gray-300 mb-2' />
                    No examination records found for this cohort.
                </div>
            ) : (
                <>
                    {/* Academic Metric Overview Cards */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                        <StatCard
                            title='Exams Conducted'
                            value={academicReportData.totalExamsConducted ?? 0}
                            icon={FiAward}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Associated Course'
                            value={academicReportData.courseTitle || 'N/A'}
                            icon={FiBook}
                            colorClass='bg-purple-50 text-purple-600'
                        />
                        <StatCard
                            title='Cohort Status'
                            value='Active Mastery'
                            icon={FiCheckCircle}
                            colorClass='bg-green-50 text-green-600'
                        />
                    </div>

                    {/* Examination Breakdown Cards & Tables */}
                    <div className='space-y-6'>
                        {academicReportData.data.map((exam, idx) => {
                            const hasRecords =
                                exam.records && exam.records.length > 0

                            return (
                                <div
                                    key={exam.examTitle || idx}
                                    className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'
                                >
                                    {/* Exam Banner Header */}
                                    <div className='p-4 sm:p-5 bg-gray-50 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3'>
                                        <div>
                                            <h3 className='font-bold text-gray-900 text-base sm:text-lg'>
                                                {exam.examTitle}
                                            </h3>
                                            <p className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
                                                <FiCalendar className='flex-shrink-0' />
                                                <span>
                                                    Conducted on:{' '}
                                                    {new Date(
                                                        exam.examDate,
                                                    ).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Macro Metric Badges */}
                                        <div className='flex flex-wrap gap-2 text-xs font-semibold'>
                                            <span className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100'>
                                                Avg: {exam.averageScore} /{' '}
                                                {exam.totalMarks} (
                                                {exam.averagePercentage}%)
                                            </span>
                                            <span className='bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100'>
                                                Highest: {exam.highestScore}
                                            </span>
                                            <span className='bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100'>
                                                Lowest: {exam.lowestScore}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 1. MOBILE RECORD CARDS (< md screens) */}
                                    <div className='block md:hidden divide-y divide-gray-100'>
                                        {hasRecords ? (
                                            exam.records.map((rec) => (
                                                <div
                                                    key={rec._id}
                                                    className='p-4 space-y-2 hover:bg-gray-50 transition-colors'
                                                >
                                                    <div className='flex items-start justify-between gap-2'>
                                                        <div>
                                                            <span className='font-semibold text-gray-900 text-sm block'>
                                                                {rec.student
                                                                    ?.fullName ||
                                                                    'Unknown Student'}
                                                            </span>
                                                            <span className='text-xs font-bold text-gray-700 mt-0.5 block'>
                                                                Score:{' '}
                                                                {
                                                                    rec.obtainedMarks
                                                                }{' '}
                                                                <span className='text-gray-400 font-normal'>
                                                                    /{' '}
                                                                    {
                                                                        exam.totalMarks
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md border flex-shrink-0 ${getGradeBadgeStyle(
                                                                rec.grade,
                                                            )}`}
                                                        >
                                                            {rec.grade || '-'}
                                                        </span>
                                                    </div>

                                                    {rec.facultyRemarks && (
                                                        <div className='text-xs text-gray-600 italic bg-gray-50 p-2 rounded-lg border border-gray-100'>
                                                            {rec.facultyRemarks}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className='p-6 text-center text-xs text-gray-400'>
                                                No evaluated students recorded
                                                for this exam.
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
                                    <div className='hidden md:block overflow-x-auto'>
                                        <table className='w-full text-left text-sm border-collapse'>
                                            <thead className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-100 bg-white'>
                                                <tr>
                                                    <th className='px-6 py-3.5'>
                                                        Student Name
                                                    </th>
                                                    <th className='px-6 py-3.5'>
                                                        Score
                                                    </th>
                                                    <th className='px-6 py-3.5 text-center'>
                                                        Grade
                                                    </th>
                                                    <th className='px-6 py-3.5'>
                                                        Faculty Remarks
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y divide-gray-100'>
                                                {hasRecords ? (
                                                    exam.records.map((rec) => (
                                                        <tr
                                                            key={rec._id}
                                                            className='hover:bg-gray-50 transition-colors'
                                                        >
                                                            <td className='px-6 py-3.5 font-medium text-gray-900'>
                                                                {rec.student
                                                                    ?.fullName ||
                                                                    'Unknown Student'}
                                                            </td>
                                                            <td className='px-6 py-3.5 font-bold text-gray-700'>
                                                                {
                                                                    rec.obtainedMarks
                                                                }{' '}
                                                                <span className='text-gray-400 font-normal text-xs'>
                                                                    /{' '}
                                                                    {
                                                                        exam.totalMarks
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className='px-6 py-3.5 text-center'>
                                                                <span
                                                                    className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md border ${getGradeBadgeStyle(
                                                                        rec.grade,
                                                                    )}`}
                                                                >
                                                                    {rec.grade ||
                                                                        '-'}
                                                                </span>
                                                            </td>
                                                            <td className='px-6 py-3.5 text-gray-600 italic text-xs'>
                                                                {rec.facultyRemarks ||
                                                                    '-'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan='4'
                                                            className='px-6 py-8 text-center text-xs text-gray-400'
                                                        >
                                                            No evaluated
                                                            students recorded
                                                            for this exam.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

export default AcademicReportView
