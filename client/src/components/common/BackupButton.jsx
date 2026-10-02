import { useState } from 'react'
import api from '../../api/axios' // Adjust this path if your axios instance is located elsewhere
import { FiDatabase, FiLoader } from 'react-icons/fi'

const BackupButton = () => {
	const [isBackingUp, setIsBackingUp] = useState(false)

	const handleBackup = async () => {
		if (
			!window.confirm(
				'Are you sure you want to run a database backup now?',
			)
		)
			return

		setIsBackingUp(true)
		try {
			const response = await api.post('/system/backup')
			alert(response.data.message)
		} catch (error) {
			alert(error.response?.data?.message || 'Failed to backup database')
		} finally {
			setIsBackingUp(false)
		}
	}

return (
        <button
            onClick={handleBackup}
            disabled={isBackingUp}
            className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap'
        >
            {isBackingUp ? (
                <FiLoader className='animate-spin text-lg text-blue-600' />
            ) : (
                <FiDatabase className='text-lg' />
            )}
            <span>{isBackingUp ? 'Backing up...' : 'Backup DB'}</span>
        </button>
    )
}
export default BackupButton
