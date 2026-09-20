// src/components/reports/views/DemoReportView.jsx
import {
    FiMonitor,
    FiStar,
    FiTarget,
    FiUserCheck,
    FiAward,
} from 'react-icons/fi'
import StatCard from '../../common/StatCard'

const DemoReportView = ({ demoReportData }) => {
    const metrics = demoReportData?.metrics || {}
    const topicPerformance = demoReportData?.topicPerformance || []
    const repPerformance = demoReportData?.repPerformance || []

    const renderRatingBadge = (rating) => {
        if (!rating || rating <= 0) {
            return (
                <span className='text-gray-400 text-xs font-medium'>
                    Unrated
                </span>
            )
        }

        return (
            <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200'>
                <FiStar className='text-amber-500 fill-current text-xs' />
                <span>{rating} / 5</span>
            </span>
        )
    }

    return (
        <div className='space-y-6 sm:space-y-8'>
            {/* Macro Metrics Strip */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
                <StatCard
                    title='Total Demos Logged'
                    value={metrics.totalDemos ?? 0}
                    icon={FiMonitor}
                    colorClass='bg-blue-50 text-blue-600'
                />
                <StatCard
                    title='Completed Demos'
                    value={metrics.completedDemos ?? 0}
                    icon={FiUserCheck}
                    colorClass='bg-green-50 text-green-600'
                />
                <StatCard
                    title='Average Client Rating'
                    value={
                        metrics.averageRating
                            ? `${metrics.averageRating} / 5`
                            : '-'
                    }
                    icon={FiStar}
                    colorClass='bg-amber-50 text-amber-600'
                />
                <StatCard
                    title='Demo-to-Close Rate'
                    value={
                        metrics.conversionRate !== undefined
                            ? `${metrics.conversionRate}%`
                            : '-'
                    }
                    icon={FiTarget}
                    colorClass='bg-purple-50 text-purple-600'
                />
            </div>

            {/* Performance Grids Container */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
                {/* 1. TOPIC PERFORMANCE */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between'>
                        <h3 className='font-bold text-gray-900 text-base sm:text-lg'>
                            Topic Performance
                        </h3>
                        <span className='text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full'>
                            {topicPerformance.length}{' '}
                            {topicPerformance.length === 1 ? 'Topic' : 'Topics'}
                        </span>
                    </div>

                    {/* Mobile Card List (< md) */}
                    <div className='block md:hidden divide-y divide-gray-100'>
                        {topicPerformance.length > 0 ? (
                            topicPerformance.map((topic, i) => (
                                <div
                                    key={topic._id || topic.id || i}
                                    className='p-4 space-y-2.5 hover:bg-gray-50 transition-colors'
                                >
                                    <div className='flex items-start justify-between gap-3'>
                                        <span className='font-semibold text-gray-900 text-sm'>
                                            {topic.title}
                                        </span>
                                        <div className='flex-shrink-0'>
                                            {renderRatingBadge(topic.avgRating)}
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'>
                                        <span>Sessions Conducted</span>
                                        <span className='font-bold text-gray-900 text-sm'>
                                            {topic.conductedCount ?? 0}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='px-4 py-8 text-center text-xs text-gray-400'>
                                No completed demo data available.
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className='hidden md:block overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-100 bg-white'>
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
                                {topicPerformance.length > 0 ? (
                                    topicPerformance.map((topic, i) => (
                                        <tr
                                            key={topic._id || topic.id || i}
                                            className='hover:bg-gray-50 transition-colors'
                                        >
                                            <td className='px-6 py-4 font-semibold text-gray-800'>
                                                {topic.title}
                                            </td>
                                            <td className='px-6 py-4 text-center text-gray-600 font-medium'>
                                                {topic.conductedCount ?? 0}
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                {renderRatingBadge(
                                                    topic.avgRating,
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan='3'
                                            className='px-6 py-8 text-center text-xs text-gray-400'
                                        >
                                            No completed demo data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. SALES REP PERFORMANCE LEADERBOARD */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between'>
                        <h3 className='font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2'>
                            <FiAward className='text-purple-600' /> Rep
                            Performance Leaderboard
                        </h3>
                        <span className='text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full'>
                            {repPerformance.length}{' '}
                            {repPerformance.length === 1 ? 'Rep' : 'Reps'}
                        </span>
                    </div>

                    {/* Mobile Card List (< md) */}
                    <div className='block md:hidden divide-y divide-gray-100'>
                        {repPerformance.length > 0 ? (
                            repPerformance.map((rep, i) => (
                                <div
                                    key={rep._id || rep.id || i}
                                    className='p-4 space-y-2.5 hover:bg-gray-50 transition-colors'
                                >
                                    <div className='flex items-start justify-between gap-3'>
                                        <span className='font-semibold text-gray-900 text-sm'>
                                            {rep.name}
                                        </span>
                                        <div className='flex-shrink-0'>
                                            {renderRatingBadge(rep.avgRating)}
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'>
                                        <span>Demos Conducted</span>
                                        <span className='font-bold text-gray-900 text-sm'>
                                            {rep.conductedCount ?? 0}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='px-4 py-8 text-center text-xs text-gray-400'>
                                No completed demo data available.
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className='hidden md:block overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-100 bg-white'>
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
                                {repPerformance.length > 0 ? (
                                    repPerformance.map((rep, i) => (
                                        <tr
                                            key={rep._id || rep.id || i}
                                            className='hover:bg-gray-50 transition-colors'
                                        >
                                            <td className='px-6 py-4 font-semibold text-gray-800'>
                                                {rep.name}
                                            </td>
                                            <td className='px-6 py-4 text-center text-gray-600 font-medium'>
                                                {rep.conductedCount ?? 0}
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                {renderRatingBadge(
                                                    rep.avgRating,
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan='3'
                                            className='px-6 py-8 text-center text-xs text-gray-400'
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
        </div>
    )
}

export default DemoReportView
