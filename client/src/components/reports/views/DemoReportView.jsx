// src/components/reports/views/DemoReportView.jsx
import { FiMonitor, FiStar, FiTarget, FiUserCheck } from 'react-icons/fi'
import StatCard from '../../common/StatCard'

const DemoReportView = ({ demoReportData }) => {
    return (
        <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                <StatCard
                    title='Total Demos Logged'
                    value={demoReportData.metrics.totalDemos}
                    icon={FiMonitor}
                    colorClass='bg-blue-50 text-blue-600'
                />
                <StatCard
                    title='Completed Demos'
                    value={demoReportData.metrics.completedDemos}
                    icon={FiUserCheck}
                    colorClass='bg-green-50 text-green-600'
                />
                <StatCard
                    title='Average Client Rating'
                    value={`${demoReportData.metrics.averageRating} / 5`}
                    icon={FiStar}
                    colorClass='bg-amber-50 text-amber-600'
                />
                <StatCard
                    title='Demo-to-Close Rate'
                    value={`${demoReportData.metrics.conversionRate}%`}
                    icon={FiTarget}
                    colorClass='bg-purple-50 text-purple-600'
                />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Topic Performance Grid */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-100 bg-gray-50'>
                        <h3 className='font-bold text-gray-900'>
                            Topic Performance
                        </h3>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-white border-b border-gray-100'>
                                <tr className='text-xs uppercase tracking-wider text-gray-900 font-bold'>
                                    <th className='px-6 py-4'>Demo Topic</th>
                                    <th className='px-6 py-4 text-center'>
                                        Conducted
                                    </th>
                                    <th className='px-6 py-4 text-center'>
                                        Avg Rating
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {demoReportData.topicPerformance.map(
                                    (topic, i) => (
                                        <tr
                                            key={i}
                                            className='hover:bg-gray-50'
                                        >
                                            <td className='px-6 py-4 font-semibold text-gray-800'>
                                                {topic.title}
                                            </td>
                                            <td className='px-6 py-4 text-center text-gray-600'>
                                                {topic.conductedCount}
                                            </td>
                                            <td className='px-6 py-4 flex items-center justify-center gap-1 font-medium text-gray-800'>
                                                {topic.avgRating > 0 ? (
                                                    <>
                                                        <FiStar className='text-amber-500 fill-current' />{' '}
                                                        {topic.avgRating}
                                                    </>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )}
                                {demoReportData.topicPerformance.length ===
                                    0 && (
                                    <tr>
                                        <td
                                            colSpan='3'
                                            className='px-6 py-8 text-center text-gray-500'
                                        >
                                            No completed demo data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sales Rep Performance Grid */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-100 bg-gray-50'>
                        <h3 className='font-bold text-gray-900'>
                            Rep Performance Leaderboard
                        </h3>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-white border-b border-gray-100'>
                                <tr className='text-xs uppercase tracking-wider text-gray-900 font-bold'>
                                    <th className='px-6 py-4'>Sales Rep</th>
                                    <th className='px-6 py-4 text-center'>
                                        Conducted
                                    </th>
                                    <th className='px-6 py-4 text-center'>
                                        Avg Rating
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {demoReportData.repPerformance.map((rep, i) => (
                                    <tr key={i} className='hover:bg-gray-50'>
                                        <td className='px-6 py-4 font-semibold text-gray-800'>
                                            {rep.name}
                                        </td>
                                        <td className='px-6 py-4 text-center text-gray-600'>
                                            {rep.conductedCount}
                                        </td>
                                        <td className='px-6 py-4 flex items-center justify-center gap-1 font-medium text-gray-800'>
                                            {rep.avgRating > 0 ? (
                                                <>
                                                    <FiStar className='text-amber-500 fill-current' />{' '}
                                                    {rep.avgRating}
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {demoReportData.repPerformance.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan='3'
                                            className='px-6 py-8 text-center text-gray-500'
                                        >
                                            No completed demo data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DemoReportView
