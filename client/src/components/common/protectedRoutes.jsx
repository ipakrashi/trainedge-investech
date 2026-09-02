import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
    // Check if the user data exists in local storage
    const userInfo = localStorage.getItem('userInfo')

    // If userInfo exists, render the protected components.
    // If not, redirect to the login route and replace the history state.
    return userInfo ? <Outlet /> : <Navigate to='/login' replace />
}

export default ProtectedRoute
