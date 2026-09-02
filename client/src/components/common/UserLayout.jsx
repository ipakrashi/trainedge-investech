import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

const UserLayout = () => {
    return (
        <>
            {/* HEADER */}
            <Navbar />
            {/* MAIN CONTENT */}
            <main>
                <Outlet />
            </main>
            {/* FOOTER */}
            <Footer />
        </>
    )
}

export default UserLayout
