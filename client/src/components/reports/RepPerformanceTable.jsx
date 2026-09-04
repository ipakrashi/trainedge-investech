const RepPerformanceTable = ({ teamData }) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='px-6 py-5 border-b border-gray-100'>
                <h3 className='font-bold text-gray-900'>
                    Representative Performance
                </h3>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider'>
                            <th className='px-6 py-3 font-medium'>Sales Rep</th>
                            <th className='px-6 py-3 font-medium'>
                                Assigned Leads
                            </th>
                            <th className='px-6 py-3 font-medium'>
                                Deals Closed
                            </th>
                            <th className='px-6 py-3 font-medium'>Win Rate</th>
                            <th className='px-6 py-3 text-right font-medium'>
                                Closed Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-sm'>
                        {teamData?.map((rep) => (
                            <tr
                                key={rep.id}
                                className='hover:bg-gray-50 transition-colors'
                            >
                                <td className='px-6 py-4'>
                                    <div className='font-medium text-gray-900'>
                                        {rep.name}
                                    </div>
                                    <div className='text-gray-500 text-xs'>
                                        {rep.role}
                                    </div>
                                </td>
                                <td className='px-6 py-4 text-gray-700'>
                                    {rep.assigned}
                                </td>
                                <td className='px-6 py-4 text-gray-700'>
                                    {rep.closed}
                                </td>
                                <td className='px-6 py-4'>
                                    <span
                                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            rep.winRate >= 30
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {rep.winRate}%
                                    </span>
                                </td>
                                <td className='px-6 py-4 text-right font-bold text-gray-900'>
                                    ₹{rep.revenue.toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RepPerformanceTable
