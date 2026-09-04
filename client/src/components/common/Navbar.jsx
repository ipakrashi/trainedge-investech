// src/components/common/Navbar.jsx
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
    FiMenu,
    FiX,
    FiUser,
    FiSettings,
    FiChevronDown,
    FiUsers,
    FiBook,
    FiShield,
    FiTarget,
    FiLayers,
    FiTrendingUp,
    FiRefreshCcw,
    FiClock, // NEW Import
} from 'react-icons/fi'
import LogoutButton from '../common/LogoutButton'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isAdminOpen, setIsAdminOpen] = useState(false)
    const navigate = useNavigate()

    const toggleMenu = () => setIsOpen(!isOpen)

    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null
    const displayName = userInfo?.firstName || 'Profile'
    const userRole = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()

    const isAdmin = userRole === 'admin'
    const isFaculty = userRole === 'faculty'

    const navClass = ({ isActive }) =>
        isActive
            ? 'text-blue-600 font-semibold block py-2 md:py-0'
            : 'text-gray-600 hover:text-blue-600 transition-colors block py-2 md:py-0'

    return (
        <nav className='bg-white shadow-sm border-b border-gray-200 w-full sticky top-0 z-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-[1fr_auto_1fr] items-center h-16'>
                    {/* Brand Logo */}
                    <div className='justify-self-start flex items-center'>
                        <Link
                            to='/'
                            className='text-lg font-bold text-blue-700 tracking-tight'
                        >
                            <img
                                src={'/Logo_final-NOBG.png'}
                                alt='Logo'
                                className='w-15'
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex items-center space-x-8 justify-self-center'>
                        <div className='flex space-x-8 items-center'>
                            <NavLink to='/' className={navClass}>
                                Dashboard
                            </NavLink>

                            {/* Role-Based Visiblity: Faculty do not sell, they deliver */}
                            {!isFaculty && (
                                <>
                                    <NavLink to='/leads' className={navClass}>
                                        Leads
                                    </NavLink>
                                    <NavLink
                                        to='/pipeline'
                                        className={navClass}
                                    >
                                        Pipeline
                                    </NavLink>
                                </>
                            )}

                            {/* Students Tab - Visible to Admin and Faculty */}
                            {(isAdmin || isFaculty) && (
                                <NavLink to='/students' className={navClass}>
                                    Students
                                </NavLink>
                            )}

                            {!isFaculty && (
                                <NavLink to='/reports' className={navClass}>
                                    Reports
                                </NavLink>
                            )}
                        </div>

                        {/* Admin Only Dropdown */}
                        {isAdmin ? (
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
                                    <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50'>
                                        <div className='px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1'>
                                            Operational Workflow
                                        </div>
                                        <Link
                                            to='/admin/pending-students'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors font-medium'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiClock /> Map Pending Students
                                        </Link>
                                        <div className='px-4 py-2 mt-1 text-xs font-bold text-gray-400 uppercase tracking-wider border-y border-gray-50 mb-1'>
                                            System Management
                                        </div>
                                        <Link
                                            to='/admin/users'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiUsers /> Manage Staff
                                        </Link>
                                        <Link
                                            to='/admin/reassign'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiRefreshCcw /> Reassign Leads
                                        </Link>
                                        <Link
                                            to='/admin/courses'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiBook /> Manage Courses
                                        </Link>
                                        <Link
                                            to='/admin/roles'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiShield /> Manage Roles
                                        </Link>
                                        <Link
                                            to='/admin/sources'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiTarget /> Manage Sources
                                        </Link>
                                        <Link
                                            to='/admin/statuses'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiLayers /> Manage Statuses
                                        </Link>
                                        <Link
                                            to='/admin/experiences'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiTrendingUp /> Manage Experiences
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Desktop User Actions */}
                    <div className='hidden md:flex items-center space-x-6 justify-self-end'>
                        <button className='flex items-center text-gray-600 hover:text-blue-600 transition-colors'>
                            <FiUser className='text-xl mr-2' />
                            <span className='font-medium whitespace-nowrap'>
                                Welcome: {displayName}
                            </span>
                        </button>
                        <LogoutButton />
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className='md:hidden flex items-center justify-self-end col-start-3'>
                        <button
                            onClick={toggleMenu}
                            className='text-gray-600 hover:text-blue-600 focus:outline-none p-2'
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

            {/* Mobile Navigation Menu Drawer */}
            {isOpen && (
                <div className='md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 z-50'>
                    <div className='px-4 pt-2 pb-4 space-y-1 flex flex-col'>
                        <NavLink
                            to='/'
                            onClick={toggleMenu}
                            className={navClass}
                        >
                            Dashboard
                        </NavLink>

                        {!isFaculty && (
                            <>
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
                            </>
                        )}

                        {(isAdmin || isFaculty) && (
                            <NavLink
                                to='/students'
                                onClick={toggleMenu}
                                className={navClass}
                            >
                                Students
                            </NavLink>
                        )}

                        {!isFaculty && (
                            <NavLink
                                to='/reports'
                                onClick={toggleMenu}
                                className={navClass}
                            >
                                Reports
                            </NavLink>
                        )}

                        {/* Admin Management Links inside Mobile Drawer */}
                        {isAdmin ? (
                            <>
                                <div className='border-t border-gray-100 my-2 pt-2'>
                                    <span className='px-1 text-xs font-bold text-gray-400 uppercase tracking-wider'>
                                        System Management
                                    </span>
                                </div>
                                <Link
                                    to='/admin/pending-students'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium rounded-lg transition-colors'
                                >
                                    <FiClock /> Map Pending Students
                                </Link>
                                <Link
                                    to='/admin/users'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                >
                                    <FiUsers /> Manage Staff
                                </Link>
                                <Link
                                    to='/admin/reassign'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                >
                                    <FiRefreshCcw /> Reassign Leads
                                </Link>
                                <Link
                                    to='/admin/courses'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                >
                                    <FiBook /> Manage Courses
                                </Link>
                                <Link
                                    to='/admin/roles'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                >
                                    <FiShield /> Manage Roles
                                </Link>
                                <Link
                                    to='/admin/sources'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                >
                                    <FiTarget /> Manage Sources
                                </Link>
                                <Link
                                    to='/admin/statuses'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                >
                                    <FiLayers /> Manage Statuses
                                </Link>
                                <Link
                                    to='/admin/experiences'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                >
                                    <FiTrendingUp /> Manage Experiences
                                </Link>
                            </>
                        ) : null}

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
