import { Navigate, Outlet } from 'react-router-dom'

const AdminRoute = () => {
    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null

    const roleName = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()

    // Restricted strictly to Admin and Accounts based on your collection records
    const isAllowed = roleName === 'admin' || roleName === 'accounts'

    return userInfo && isAllowed ? <Outlet /> : <Navigate to='/' replace />
}

export default AdminRoute
