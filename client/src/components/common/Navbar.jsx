import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
    FiMenu,
    FiX,
    FiUser,
    FiLogOut,
    FiSettings,
    FiChevronDown,
    FiUsers,
    FiBook,
    FiShield,
} from 'react-icons/fi'
import LogoutButton from '../common/LogoutButton'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isAdminOpen, setIsAdminOpen] = useState(false)
    const navigate = useNavigate()

    const toggleMenu = () => setIsOpen(!isOpen)

    // 1. Retrieve and parse the user data
    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null

    // 2. Set a fallback just in case the data is missing
    const displayName = userInfo?.firstName || 'Profile'

    // Helper function to apply active states to navigation links
    const navClass = ({ isActive }) =>
        isActive
            ? 'text-blue-600 font-semibold block py-2 md:py-0'
            : 'text-gray-600 hover:text-blue-600 transition-colors block py-2 md:py-0'

    return (
        <nav className='bg-white shadow-sm border-b border-gray-200 w-full sticky top-0 z-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16'>
                    {/* Brand Logo */}
                    <div className='flex-shrink-0 flex items-center'>
                        <Link
                            to='/'
                            className='text-lg font-bold text-blue-700 tracking-tight'
                        >
                            <img
                                src={'/Logo_final-NOBG.png'}
                                alt='Logo'
                                className='w-15'
                            />
                            {/* Investech LMS */}
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex space-x-8 items-center'>
                        <NavLink to='/' className={navClass}>
                            Dashboard
                        </NavLink>
                        <NavLink to='/leads' className={navClass}>
                            Leads
                        </NavLink>
                        <NavLink to='/pipeline' className={navClass}>
                            Pipeline
                        </NavLink>
                        <NavLink to='/reports' className={navClass}>
                            Reports
                        </NavLink>
                    </div>

                    {/* Admin Only Dropdown */}

                    {userInfo?.role === 'admin' && (
                        <div className='relative'>
                            <button
                                onClick={() => setIsAdminOpen(!isAdminOpen)}
                                className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50'
                            >
                                <FiSettings className='text-gray-500' />
                                Admin
                                <FiChevronDown
                                    className={`transition-transform duration-200 ${isAdminOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isAdminOpen && (
                                <div className='absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50'>
                                    <div className='px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1'>
                                        System Management
                                    </div>
                                    <Link
                                        to='/admin/users'
                                        className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                        onClick={() => setIsAdminOpen(false)}
                                    >
                                        <FiUsers /> Manage Staff
                                    </Link>
                                    <Link
                                        to='/admin/courses'
                                        className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                        onClick={() => setIsAdminOpen(false)}
                                    >
                                        <FiBook /> Manage Courses
                                    </Link>
                                    <Link
                                        to='/admin/roles'
                                        className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                        onClick={() => setIsAdminOpen(false)}
                                    >
                                        <FiShield /> Manage Roles
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Desktop User Actions */}
                    <div className='hidden md:flex items-center space-x-6'>
                        <button className='flex items-center text-gray-600 hover:text-blue-600 transition-colors'>
                            <FiUser className='text-xl mr-2' />
                            <span className='font-medium whitespace-nowrap'>
                                Welcome: {displayName}
                            </span>
                        </button>
                        <LogoutButton />
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className='md:hidden flex items-center'>
                        <button
                            onClick={toggleMenu}
                            className='text-gray-600 hover:text-blue-600 focus:outline-none p-2'
                            aria-label='Toggle navigation'
                        >
                            {isOpen ? (
                                <FiX className='text-2xl' />
                            ) : (
                                <FiMenu className='text-2xl' />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
                <div className='md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0'>
                    <div className='px-4 pt-2 pb-4 space-y-1 flex flex-col'>
                        {/* Using toggleMenu onClick so the menu closes when a user navigates */}
                        <NavLink
                            to='/'
                            onClick={toggleMenu}
                            className={navClass}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to='/leads'
                            onClick={toggleMenu}
                            className={navClass}
                        >
                            Leads
                        </NavLink>
                        <NavLink
                            to='/pipeline'
                            onClick={toggleMenu}
                            className={navClass}
                        >
                            Pipeline
                        </NavLink>
                        <NavLink
                            to='/reports'
                            onClick={toggleMenu}
                            className={navClass}
                        >
                            Reports
                        </NavLink>

                        <div className='border-t border-gray-100 my-2 pt-2'></div>

                        <button className='flex items-center text-gray-600 hover:text-blue-600 py-2 w-full text-left'>
                            <FiUser className='text-xl mr-3' />
                            {displayName}
                        </button>
                        <LogoutButton />
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
