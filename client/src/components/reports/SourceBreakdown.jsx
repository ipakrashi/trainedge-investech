const SourceBreakdown = ({ sources }) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='font-bold text-gray-900 mb-2'>
                Lead Acquisition Channels
            </h3>
            <p className='text-xs text-gray-500 mb-6'>
                Volume and conversion quality by initial touchpoint.
            </p>

            <div className='space-y-5'>
                {sources.map((src) => (
                    <div key={src.name} className='space-y-2'>
                        <div className='flex justify-between items-center text-sm'>
                            <span className='font-medium text-gray-800'>
                                {src.name}
                            </span>
                            <div className='text-right'>
                                <span className='font-bold text-gray-900'>
                                    ₹{src.revenue.toLocaleString()}
                                </span>
                                <span className='text-gray-400 text-xs ml-2'>
                                    ({src.conversionRate}% conv.)
                                </span>
                            </div>
                        </div>

                        <div className='w-full bg-gray-100 rounded-full h-2.5 overflow-hidden'>
                            <div
                                className='bg-blue-600 h-full rounded-full'
                                style={{ width: `${src.percentage}%` }}
                            />
                        </div>

                        <div className='flex justify-between text-xs text-gray-400'>
                            <span>{src.totalLeads} total leads</span>
                            <span>{src.percentage}% of pipeline</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SourceBreakdown
