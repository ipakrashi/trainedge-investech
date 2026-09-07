// src/components/reports/views/CoursesReportView.jsx
import { FiBook } from 'react-icons/fi'

const CoursesReportView = ({ courseReportData }) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center'>
                <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                    <FiBook className='text-blue-600' /> Course-wise Enrollment
                    Breakdown
                </h3>
                <span className='bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full'>
                    {courseReportData.totalEnrollments} Total Subject
                    Enrollments
                </span>
            </div>
            <div className='overflow-x-auto'>
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
                    <tbody className='divide-y divide-gray-100'>
                        {courseReportData.courses.map((c, i) => (
                            <tr
                                key={i}
                                className='hover:bg-gray-50 transition-colors'
                            >
                                <td className='px-6 py-4 font-semibold text-gray-900'>
                                    {c.title}
                                </td>
                                <td className='px-6 py-4 text-right text-gray-700'>
                                    {c.count}
                                </td>
                                <td className='px-6 py-4 text-right font-medium text-green-600'>
                                    ₹{c.revenue.toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CoursesReportView
