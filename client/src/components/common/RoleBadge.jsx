// src/components/common/RoleBadge.jsx
import { FiShield } from 'react-icons/fi'

const RoleBadge = ({ role }) => {
    // Safely parse role whether it's passed as an object, string, or undefined
    const safeRole = (
        typeof role === 'string' ? role : role?.name || 'N/A'
    ).toLowerCase()

    let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200'
    let isAdmin = false

    switch (safeRole) {
        case 'admin':
            colorClasses = 'bg-purple-50 text-purple-700 border-purple-200'
            isAdmin = true
            break
        case 'sales':
            colorClasses = 'bg-blue-50 text-blue-700 border-blue-200'
            break
        case 'faculty':
            colorClasses = 'bg-amber-50 text-amber-700 border-amber-200'
            break
        case 'accounts':
            colorClasses = 'bg-green-50 text-green-700 border-green-200'
            break
        default:
            break
    }

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase w-fit tracking-wider ${colorClasses}`}
        >
            {isAdmin && <FiShield className='text-[10px]' />}
            {safeRole !== 'n/a' ? safeRole : 'Staff'}
        </span>
    )
}

export default RoleBadge
