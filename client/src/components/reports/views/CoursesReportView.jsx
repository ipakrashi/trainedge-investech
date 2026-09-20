// src/components/reports/views/CoursesReportView.jsx
import { FiBook, FiUsers, FiTrendingUp } from 'react-icons/fi'

const CoursesReportView = ({ courseReportData }) => {
    const courses = courseReportData?.courses || []
    const totalEnrollments = courseReportData?.totalEnrollments ?? 0
    const hasCourses = courses.length > 0

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            {/* Header Banner */}
            <div className='px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
                <h3 className='font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2'>
                    <FiBook className='text-blue-600 flex-shrink-0' />{' '}
                    Course-wise Enrollment Breakdown
                </h3>
                <span className='bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-3 py-1 rounded-full'>
                    {totalEnrollments} Total Subject{' '}
                    {totalEnrollments === 1 ? 'Enrollment' : 'Enrollments'}
                </span>
            </div>

            {/* 1. MOBILE CARD VIEW (< md screens) */}
            <div className='block md:hidden divide-y divide-gray-100'>
                {hasCourses ? (
                    courses.map((course, i) => (
                        <div
                            key={course._id || course.id || i}
                            className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                        >
                            <div className='font-semibold text-gray-900 text-sm'>
                                {course.title}
                            </div>

                            <div className='grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100'>
                                <div className='space-y-0.5'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1'>
                                        <FiUsers className='text-gray-400' />{' '}
                                        Enrolled
                                    </span>
                                    <span className='font-bold text-gray-800 text-sm'>
                                        {course.count ?? 0}
                                    </span>
                                </div>

                                <div className='space-y-0.5 text-right'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-end gap-1'>
                                        <FiTrendingUp className='text-gray-400' />{' '}
                                        Exp. Revenue
                                    </span>
                                    <span className='font-bold text-emerald-600 text-sm'>
                                        ₹
                                        {(course.revenue || 0).toLocaleString(
                                            'en-IN',
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='p-6 text-center text-xs text-gray-400'>
                        No course enrollment data found.
                    </div>
                )}
            </div>

            {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
            <div className='hidden md:block overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-100 bg-gray-50'>
                            <th className='px-6 py-4'>Course Title</th>
                            <th className='px-6 py-4 text-right'>
                                Students Enrolled
                            </th>
                            <th className='px-6 py-4 text-right'>
                                Expected Course Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {hasCourses ? (
                            courses.map((c, i) => (
                                <tr
                                    key={c._id || c.id || i}
                                    className='hover:bg-gray-50 transition-colors'
                                >
                                    <td className='px-6 py-4 font-semibold text-gray-900'>
                                        {c.title}
                                    </td>
                                    <td className='px-6 py-4 text-right text-gray-700 font-medium'>
                                        {c.count ?? 0}
                                    </td>
                                    <td className='px-6 py-4 text-right font-semibold text-emerald-600'>
                                        ₹
                                        {(c.revenue || 0).toLocaleString(
                                            'en-IN',
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan='3'
                                    className='px-6 py-8 text-center text-sm text-gray-400'
                                >
                                    No course enrollment data found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CoursesReportView
