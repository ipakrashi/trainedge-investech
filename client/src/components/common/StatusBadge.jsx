// src/components/common/StatusBadge.jsx

const StatusBadge = ({ status }) => {
    let colorClasses = 'bg-gray-100 text-gray-700 border-gray-300'

    switch (status) {
        case 'NEW':
            colorClasses = 'bg-blue-50 text-blue-700 border-blue-200'
            break
        case 'CONTACTED':
            colorClasses = 'bg-yellow-50 text-yellow-700 border-yellow-200'
            break
        case 'QUALIFIED':
            colorClasses = 'bg-purple-50 text-purple-700 border-purple-200'
            break
        case 'DEMO_SCHEDULED':
            colorClasses = 'bg-orange-50 text-orange-700 border-orange-200'
            break
        case 'DEMO_ATTENDED':
            colorClasses = 'bg-teal-50 text-teal-700 border-teal-200'
            break
        case 'ENROLLED':
            colorClasses = 'bg-green-50 text-green-700 border-green-200'
            break
        case 'LOST':
            colorClasses = 'bg-red-50 text-red-700 border-red-200'
            break
        case 'JUNK':
            colorClasses = 'bg-gray-100 text-gray-700 border-gray-300'
            break
        default:
            break
    }

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${colorClasses}`}
        >
            {status ? status.replace('_', ' ') : 'UNKNOWN'}
        </span>
    )
}

export default StatusBadge
