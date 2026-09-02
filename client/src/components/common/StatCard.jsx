const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    colorClass,
}) => (
    <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between'>
        <div>
            <p className='text-sm font-medium text-gray-500 mb-1'>{title}</p>
            <h3 className='text-2xl font-bold text-gray-900'>{value}</h3>
            {trend && (
                <p
                    className={`text-sm mt-2 font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%{' '}
                    <span className='text-gray-400 font-normal ml-1'>
                        {trendLabel}
                    </span>
                </p>
            )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className='text-xl' />
        </div>
    </div>
)

export default StatCard
