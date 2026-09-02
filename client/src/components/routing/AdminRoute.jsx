import { Navigate, Outlet } from 'react-router-dom'

const AdminRoute = () => {
    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null

    // If they exist and are an admin, render the requested page (<Outlet />). Otherwise, redirect.
    return userInfo && userInfo.role === 'admin' ? (
        <Outlet />
    ) : (
        <Navigate to='/' replace />
    )
}

export default AdminRoute
