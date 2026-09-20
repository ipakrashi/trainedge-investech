// src/components/reports/RepPerformanceTable.jsx
import RoleBadge from '../common/RoleBadge'

const RepPerformanceTable = ({ teamData }) => {
    const hasData = teamData && teamData.length > 0

    const getWinRateBadgeClass = (rate) =>
        rate >= 30
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-yellow-100 text-yellow-700 border-yellow-200'

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            {/* Header */}
            <div className='px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100'>
                <h3 className='font-bold text-gray-900 text-base sm:text-lg'>
                    Representative Performance
                </h3>
            </div>

            {/* 1. MOBILE CARD VIEW (< md screens) */}
            <div className='block md:hidden divide-y divide-gray-100'>
                {hasData ? (
                    teamData.map((rep) => (
                        <div
                            key={rep.id || rep._id || rep.name}
                            className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                        >
                            {/* Top Row: Rep Identity & Win Rate */}
                            <div className='flex items-start justify-between gap-2'>
                                <div>
                                    <div className='font-semibold text-gray-900 text-sm'>
                                        {rep.name}
                                    </div>
                                    <div className='mt-1'>
                                        <RoleBadge role={rep.role} />
                                    </div>
                                </div>
                                <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getWinRateBadgeClass(
                                        rep.winRate || 0,
                                    )}`}
                                >
                                    {rep.winRate || 0}% Win Rate
                                </span>
                            </div>

                            {/* Metrics Summary Strip */}
                            <div className='grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-center'>
                                <div>
                                    <span className='block text-[11px] font-medium text-gray-500 uppercase tracking-wider'>
                                        Assigned
                                    </span>
                                    <span className='font-bold text-gray-800 text-sm'>
                                        {rep.assigned ?? 0}
                                    </span>
                                </div>
                                <div>
                                    <span className='block text-[11px] font-medium text-gray-500 uppercase tracking-wider'>
                                        Closed
                                    </span>
                                    <span className='font-bold text-gray-800 text-sm'>
                                        {rep.closed ?? 0}
                                    </span>
                                </div>
                                <div>
                                    <span className='block text-[11px] font-medium text-gray-500 uppercase tracking-wider'>
                                        Revenue
                                    </span>
                                    <span className='font-bold text-gray-900 text-sm'>
                                        ₹
                                        {(rep.revenue || 0).toLocaleString(
                                            'en-IN',
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='px-4 py-8 text-center text-sm text-gray-500'>
                        No representative performance records found.
                    </div>
                )}
            </div>

            {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
            <div className='hidden md:block overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='bg-gray-50 text-gray-900 text-xs uppercase tracking-wider border-b border-gray-100'>
                            <th className='px-6 py-3 font-bold'>Sales Rep</th>
                            <th className='px-6 py-3 font-bold'>
                                Assigned Leads
                            </th>
                            <th className='px-6 py-3 font-bold'>
                                Deals Closed
                            </th>
                            <th className='px-6 py-3 font-bold'>Win Rate</th>
                            <th className='px-6 py-3 text-right font-bold'>
                                Closed Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {hasData ? (
                            teamData.map((rep) => (
                                <tr
                                    key={rep.id || rep._id || rep.name}
                                    className='hover:bg-gray-50 transition-colors'
                                >
                                    <td className='px-6 py-4'>
                                        <div className='font-medium text-gray-900'>
                                            {rep.name}
                                        </div>
                                        <div className='mt-1'>
                                            <RoleBadge role={rep.role} />
                                        </div>
                                    </td>
                                    <td className='px-6 py-4 text-gray-700'>
                                        {rep.assigned ?? 0}
                                    </td>
                                    <td className='px-6 py-4 text-gray-700'>
                                        {rep.closed ?? 0}
                                    </td>
                                    <td className='px-6 py-4'>
                                        <span
                                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getWinRateBadgeClass(
                                                rep.winRate || 0,
                                            )}`}
                                        >
                                            {rep.winRate || 0}%
                                        </span>
                                    </td>
                                    <td className='px-6 py-4 text-right font-bold text-gray-900'>
                                        ₹
                                        {(rep.revenue || 0).toLocaleString(
                                            'en-IN',
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan='5'
                                    className='px-6 py-8 text-center text-gray-500'
                                >
                                    No representative performance records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RepPerformanceTable
