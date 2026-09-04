const ConversionFunnel = ({ funnelData }) => {
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='font-bold text-gray-900 mb-2'>Conversion Funnel</h3>
            <p className='text-xs text-gray-500 mb-6'>
                Stage-by-stage progression and conversion drop-off.
            </p>

            <div className='space-y-4'>
                {funnelData?.map((stage, idx) => (
                    <div key={stage.label} className='space-y-1.5'>
                        <div className='flex justify-between text-sm'>
                            <span className='font-medium text-gray-700'>
                                {stage.label}
                            </span>
                            <span className='text-gray-500'>
                                <span className='font-semibold text-gray-900'>
                                    {stage.count}
                                </span>{' '}
                                leads ({stage.rate}%)
                            </span>
                        </div>

                        <div className='w-full bg-gray-100 rounded-full h-3 overflow-hidden'>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${stage.color || 'bg-blue-600'}`}
                                style={{ width: `${stage.rate}%` }}
                            />
                        </div>

                        {idx < funnelData.length - 1 && (
                            <div className='text-[11px] text-gray-400 pl-1'>
                                ↓ {funnelData[idx + 1].dropOff || 0}% drop-off
                                to next stage
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ConversionFunnel
