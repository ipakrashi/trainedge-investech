// src/components/reports/views/AcademicReportView.jsx
import { FiLayers, FiAward, FiBook, FiCheckCircle } from 'react-icons/fi'
import StatCard from '../../common/StatCard'

const AcademicReportView = ({
    batches,
    selectedBatchId,
    onSelectBatchId,
    academicReportData,
    isLoading,
}) => {
    return (
        <div className='space-y-6'>
            {/* Batch Selector Bar */}
            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4'>
                <span className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                    <FiLayers className='text-blue-600' /> Select Cohort /
                    Batch:
                </span>
                <select
                    value={selectedBatchId}
                    onChange={(e) => onSelectBatchId(e.target.value)}
                    className='border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-blue-500 bg-gray-50 max-w-xs w-full outline-none'
                >
                    {batches.map((b) => (
                        <option key={b._id} value={b._id}>
                            {b.batchName} ({b.status})
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className='text-center py-12 text-gray-500'>
                    Compiling academic assessment reports...
                </div>
            ) : !academicReportData || academicReportData.data?.length === 0 ? (
                <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500'>
                    No examination records found for this cohort.
                </div>
            ) : (
                <>
                    {/* Academic Metric Overview Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <StatCard
                            title='Exams Conducted'
                            value={academicReportData.totalExamsConducted}
                            icon={FiAward}
                            colorClass='bg-blue-50 text-blue-600'
                        />
                        <StatCard
                            title='Associated Course'
                            value={academicReportData.courseTitle}
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

                    {/* Examination Breakdown Tables */}
                    <div className='space-y-6'>
                        {academicReportData.data.map((exam, idx) => (
                            <div
                                key={idx}
                                className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'
                            >
                                <div className='px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
                                    <div>
                                        <h3 className='font-bold text-gray-900 text-lg'>
                                            {exam.examTitle}
                                        </h3>
                                        <p className='text-xs text-gray-500'>
                                            Conducted on:{' '}
                                            {new Date(
                                                exam.examDate,
                                            ).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                    <div className='flex gap-3 text-xs font-semibold'>
                                        <span className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full'>
                                            Avg: {exam.averageScore} /{' '}
                                            {exam.totalMarks} (
                                            {exam.averagePercentage}%)
                                        </span>
                                        <span className='bg-green-50 text-green-700 px-3 py-1 rounded-full'>
                                            Highest: {exam.highestScore}
                                        </span>
                                        <span className='bg-amber-50 text-amber-700 px-3 py-1 rounded-full'>
                                            Lowest: {exam.lowestScore}
                                        </span>
                                    </div>
                                </div>
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-left text-sm border-collapse'>
                                        <thead className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-100 bg-white'>
                                            <tr>
                                                <th className='px-6 py-3'>
                                                    Student Name
                                                </th>
                                                <th className='px-6 py-3'>
                                                    Score
                                                </th>
                                                <th className='px-6 py-3'>
                                                    Grade
                                                </th>
                                                <th className='px-6 py-3'>
                                                    Faculty Remarks
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {exam.records.map((rec) => (
                                                <tr
                                                    key={rec._id}
                                                    className='hover:bg-gray-50'
                                                >
                                                    <td className='px-6 py-3 font-medium text-gray-900'>
                                                        {rec.student
                                                            ?.fullName ||
                                                            'Unknown'}
                                                    </td>
                                                    <td className='px-6 py-3 font-bold text-gray-700'>
                                                        {rec.obtainedMarks}{' '}
                                                        <span className='text-gray-400 font-normal text-xs'>
                                                            / {exam.totalMarks}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-3'>
                                                        <span className='px-2 py-0.5 bg-gray-100 text-gray-700 font-bold text-xs rounded'>
                                                            {rec.grade || '-'}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-3 text-gray-600 italic text-xs'>
                                                        {rec.facultyRemarks ||
                                                            '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default AcademicReportView
