import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiLogOut } from 'react-icons/fi'

const LogoutButton = () => {
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            // Call the backend to destroy the HTTP-only cookie
            await axios.post(
                '/api/users/logout',
                {}, // empty body
                {
                    // CRUCIAL: Must send credentials so the backend knows WHICH cookie to destroy
                    withCredentials: true,
                },
            )

            // Clear the local user data
            localStorage.removeItem('userInfo')

            // Redirect to login page
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <button
            onClick={handleLogout}
            className='flex items-center text-red-500 hover:text-red-700 transition-colors w-full text-left py-2 md:py-0'
        >
            <FiLogOut className='text-xl md:mr-2 mr-3' />
            <span className='font-medium'>Logout</span>
        </button>
    )
}

export default LogoutButton
