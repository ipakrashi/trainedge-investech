// src/components/common/Navbar.jsx
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
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
    FiClock,
    FiDollarSign,
    FiCreditCard,
} from 'react-icons/fi'
import LogoutButton from '../common/LogoutButton'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isAdminOpen, setIsAdminOpen] = useState(false)

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
    const isSales = userRole === 'sales'
    const isAccounts = userRole === 'accounts'

    const navClass = ({ isActive }) =>
        isActive
            ? 'text-blue-600 font-semibold block py-2 md:py-0'
            : 'text-gray-600 hover:text-blue-600 transition-colors block py-2 md:py-0'

    return (
        <nav className='bg-white shadow-sm border-b border-gray-200 w-full sticky top-0 z-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    {/* Left Section: Brand Logo & User Welcome Message */}
                    <div className='flex items-center space-x-6'>
                        <Link
                            to='/'
                            className='text-lg font-bold text-blue-700 tracking-tight flex items-center'
                        >
                            <img
                                src={'/Logo_final-NOBG.png'}
                                alt='Logo'
                                className='w-15'
                            />
                        </Link>
                        <div className='hidden lg:flex items-center text-gray-600 border-l border-gray-200 pl-6'>
                            <FiUser
                                className='text-xl mr-2 text-gray-700'
                                font-bold
                            />
                            <span className='font-medium text-sm whitespace-nowrap'>
                                <span
                                    className={
                                        isAdmin
                                            ? 'text-red-700 bg-red-50 border border-red-200 font-semibold px-2 py-1 rounded-2xl'
                                            : isSales
                                              ? 'text-blue-700 bg-blue-50 border border-blue-200 font-semibold px-2 py-1 rounded-2xl'
                                              : isFaculty
                                                ? 'text-amber-700 bg-amber-50 border border-amber-200 font-semibold px-2 py-1 rounded-2xl'
                                                : isAccounts
                                                  ? 'text-green-700 bg-green-50 border border-green-200 font-semibold px-2 py-1 rounded-2xl'
                                                  : 'text-gray-700 bg-gray-50 border border-gray-200 font-semibold px-2 py-1 rounded-2xl'
                                    }
                                >
                                    Welcome, {displayName}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Right Section: Navigation Links, Admin/Finance Dropdown & Logout */}
                    <div className='hidden md:flex items-center space-x-6'>
                        <div className='flex space-x-6 items-center text-sm font-medium'>
                            <NavLink to='/' className={navClass}>
                                Dashboard
                            </NavLink>

                            {(isAdmin || isSales) && (
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

                            {(isAdmin || isFaculty) && (
                                <>
                                    <NavLink
                                        to='/students'
                                        className={navClass}
                                    >
                                        Students
                                    </NavLink>
                                    <NavLink to='/batches' className={navClass}>
                                        Batches
                                    </NavLink>
                                </>
                            )}

                            {(isAdmin || isSales || isAccounts) && (
                                <NavLink to='/reports' className={navClass}>
                                    Reports
                                </NavLink>
                            )}
                        </div>

                        {/* Admin / Accounts Dropdown */}
                        {(isAdmin || isAccounts) && (
                            <div className='relative'>
                                <button
                                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                                    className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50'
                                >
                                    <FiSettings className='text-gray-500' />
                                    {isAdmin ? 'Admin' : 'Finance'}
                                    <FiChevronDown
                                        className={`transition-transform duration-200 ${isAdminOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isAdminOpen && (
                                    <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50'>
                                        {isAdmin && (
                                            <>
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
                                                    <FiClock /> Map Pending
                                                    Students
                                                </Link>
                                                <Link
                                                    to='/batches'
                                                    className='flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium'
                                                    onClick={() =>
                                                        setIsAdminOpen(false)
                                                    }
                                                >
                                                    <FiUsers /> Manage Batches
                                                </Link>
                                            </>
                                        )}

                                        <div className='px-4 py-2 mt-1 text-xs font-bold text-gray-400 uppercase tracking-wider border-y border-gray-50 mb-1'>
                                            Financial Controls
                                        </div>
                                        <Link
                                            to='/admin/payments'
                                            className='flex items-center gap-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors font-medium'
                                            onClick={() =>
                                                setIsAdminOpen(false)
                                            }
                                        >
                                            <FiDollarSign /> Fee Payments
                                        </Link>

                                        {isAdmin && (
                                            <>
                                                <Link
                                                    to='/admin/payment-modes'
                                                    className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
                                                    onClick={() =>
                                                        setIsAdminOpen(false)
                                                    }
                                                >
                                                    <FiCreditCard /> Manage
                                                    Payment Modes
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
                                                    <FiRefreshCcw /> Reassign
                                                    Leads
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
                                                    <FiTrendingUp /> Manage
                                                    Experiences
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <LogoutButton />
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className='md:hidden flex items-center'>
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

            {/* Mobile Navigation Menu Drawer - Fixed scrolling & bottom clearance */}
            {isOpen && (
                <div className='md:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full left-0 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto'>
                    <div className='px-4 pt-3 pb-24 space-y-1 flex flex-col'>
                        <div className='flex items-center text-gray-600 py-3 px-1 border-b border-gray-100 mb-2 font-medium'>
                            <FiUser className='text-xl mr-3 text-gray-400' />
                            <span>Welcome: {displayName}</span>
                        </div>

                        <NavLink
                            to='/'
                            onClick={toggleMenu}
                            className={navClass}
                        >
                            Dashboard
                        </NavLink>

                        {(isAdmin || isSales) && (
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
                            <>
                                <NavLink
                                    to='/students'
                                    onClick={toggleMenu}
                                    className={navClass}
                                >
                                    Students
                                </NavLink>
                                <NavLink
                                    to='/batches'
                                    onClick={toggleMenu}
                                    className={navClass}
                                >
                                    Batches
                                </NavLink>
                            </>
                        )}

                        {(isAdmin || isSales || isAccounts) && (
                            <NavLink
                                to='/reports'
                                onClick={toggleMenu}
                                className={navClass}
                            >
                                Reports
                            </NavLink>
                        )}

                        {isAdmin || isAccounts ? (
                            <>
                                <div className='border-t border-gray-100 my-2 pt-2'>
                                    <span className='px-1 text-xs font-bold text-gray-400 uppercase tracking-wider'>
                                        Controls & Finance
                                    </span>
                                </div>
                                <Link
                                    to='/admin/payments'
                                    onClick={toggleMenu}
                                    className='flex items-center gap-3 px-3 py-2 text-sm text-green-600 hover:bg-green-50 font-medium rounded-lg transition-colors'
                                >
                                    <FiDollarSign /> Fee Payments
                                </Link>
                                {isAdmin && (
                                    <>
                                        <Link
                                            to='/admin/payment-modes'
                                            onClick={toggleMenu}
                                            className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                        >
                                            <FiCreditCard /> Manage Payment
                                            Modes
                                        </Link>
                                        <Link
                                            to='/batches'
                                            onClick={toggleMenu}
                                            className='flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors'
                                        >
                                            <FiUsers /> Manage Batches
                                        </Link>
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
                                )}
                            </>
                        ) : null}

                        <div className='border-t border-gray-100 my-4 pt-3'>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
