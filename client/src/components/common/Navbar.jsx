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
    FiMonitor,
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

    // Shared styling for the Role Badge (Desktop & Mobile)
    const roleBadgeClass = `font-semibold px-3 py-1 rounded-2xl border text-sm ${
        isAdmin
            ? 'text-purple-700 bg-purple-50 border-purple-200'
            : isSales
              ? 'text-blue-700 bg-blue-50 border-blue-200'
              : isFaculty
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : isAccounts
                  ? 'text-green-700 bg-green-50 border-green-200'
                  : 'text-gray-700 bg-gray-50 border-gray-200'
    }`

    // Helper for Megamenu Link Styling
    const MegaMenuLink = ({ to, icon: Icon, label, colorClass = 'blue' }) => {
        const colorStyles = {
            blue: 'hover:text-blue-600 hover:bg-blue-50 group-hover:text-blue-600 group-hover:bg-blue-100',
            green: 'hover:text-green-600 hover:bg-green-50 group-hover:text-green-600 group-hover:bg-green-100',
            purple: 'hover:text-purple-600 hover:bg-purple-50 group-hover:text-purple-600 group-hover:bg-purple-100',
            orange: 'hover:text-orange-600 hover:bg-orange-50 group-hover:text-orange-600 group-hover:bg-orange-100',
        }

        return (
            <Link
                to={to}
                onClick={() => setIsAdminOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2 text-sm text-gray-600 rounded-lg transition-all duration-200 ${colorStyles[colorClass].split(' ')[0]} ${colorStyles[colorClass].split(' ')[1]}`}
            >
                <div
                    className={`bg-gray-50 text-gray-400 p-1.5 rounded-md transition-colors ${colorStyles[colorClass].split(' ')[2]} ${colorStyles[colorClass].split(' ')[3]}`}
                >
                    <Icon className='text-base' />
                </div>
                <span className='font-medium'>{label}</span>
            </Link>
        )
    }

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
                            <FiUser className='text-xl mr-2 text-gray-700' />
                            <span className='whitespace-nowrap'>
                                <span className={roleBadgeClass}>
                                    Welcome, {displayName}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Right Section: Navigation Links, Admin Megamenu & Logout */}
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
                                    <NavLink
                                        to='/demos/calendar'
                                        className={navClass}
                                    >
                                        Demos
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

                        {/* Admin / Accounts Dropdown Trigger */}
                        {(isAdmin || isAccounts) && (
                            <div className='relative'>
                                <button
                                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                                    className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 focus:outline-none'
                                >
                                    <FiSettings className='text-gray-500' />
                                    {isAdmin ? 'Admin' : 'Finance'}
                                    <FiChevronDown
                                        className={`transition-transform duration-200 ${isAdminOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Panels */}
                                {isAdminOpen && (
                                    <div
                                        className={`absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 transform origin-top-right transition-all ${isAdmin ? 'w-[750px]' : 'w-64'}`}
                                    >
                                        {isAdmin ? (
                                            /* --- THE ADMIN MEGAMENU --- */
                                            <div className='grid grid-cols-3 gap-8 p-6'>
                                                {/* Column 1: Operations */}
                                                <div>
                                                    <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2'>
                                                        Operational Workflow
                                                    </h3>
                                                    <div className='space-y-1'>
                                                        <MegaMenuLink
                                                            to='/admin/pending-students'
                                                            icon={FiClock}
                                                            label='Map Pending Students'
                                                            colorClass='orange'
                                                        />
                                                        <MegaMenuLink
                                                            to='/batches'
                                                            icon={FiUsers}
                                                            label='Manage Batches'
                                                            colorClass='blue'
                                                        />
                                                    </div>
                                                </div>

                                                {/* Column 2: Finance */}
                                                <div>
                                                    <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2'>
                                                        Financial Controls
                                                    </h3>
                                                    <div className='space-y-1'>
                                                        <MegaMenuLink
                                                            to='/admin/payments'
                                                            icon={FiDollarSign}
                                                            label='Fee Payments'
                                                            colorClass='green'
                                                        />
                                                        <MegaMenuLink
                                                            to='/admin/payment-modes'
                                                            icon={FiCreditCard}
                                                            label='Manage Payment Modes'
                                                            colorClass='green'
                                                        />
                                                    </div>
                                                </div>

                                                {/* Column 3: System */}
                                                <div>
                                                    <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2'>
                                                        System Management
                                                    </h3>
                                                    <div className='space-y-1'>
                                                        <MegaMenuLink
                                                            to='/admin/demo-master'
                                                            icon={FiMonitor}
                                                            label='Manage Demos'
                                                            colorClass='purple'
                                                        />
                                                        <MegaMenuLink
                                                            to='/admin/users'
                                                            icon={FiUsers}
                                                            label='Manage Staff'
                                                            colorClass='purple'
                                                        />
                                                        <MegaMenuLink
                                                            to='/admin/reassign'
                                                            icon={FiRefreshCcw}
                                                            label='Reassign Leads'
                                                            colorClass='purple'
                                                        />
                                                        <MegaMenuLink
                                                            to='/admin/courses'
                                                            icon={FiBook}
                                                            label='Manage Courses'
                                                            colorClass='purple'
                                                        />
                                                        <MegaMenuLink
                                                            to='/admin/roles'
                                                            icon={FiShield}
                                                            label='Manage Roles'
                                                            colorClass='purple'
                                                        />
                                                        <MegaMenuLink
                                                            to='/admin/sources'
                                                            icon={FiTarget}
                                                            label='Manage Sources'
                                                            colorClass='purple'
                                                        />
                                                        <MegaMenuLink
                                                            to='/admin/statuses'
                                                            icon={FiLayers}
                                                            label='Manage Statuses'
                                                            colorClass='purple'
                                                        />
                                                        <MegaMenuLink
                                                            to='/admin/experiences'
                                                            icon={FiTrendingUp}
                                                            label='Manage Experiences'
                                                            colorClass='purple'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* --- ACCOUNTS ONLY DROPDOWN --- */
                                            <div className='py-2 px-2'>
                                                <div className='px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1'>
                                                    Financial Controls
                                                </div>
                                                <MegaMenuLink
                                                    to='/admin/payments'
                                                    icon={FiDollarSign}
                                                    label='Fee Payments'
                                                    colorClass='green'
                                                />
                                            </div>
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

            {/* Mobile Navigation Menu Drawer */}
            {isOpen && (
                <div className='md:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full left-0 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto'>
                    {/* NEW: Sticky Welcome Header with Dynamic Colors */}
                    <div className='sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-4 py-4 border-b border-gray-100 shadow-sm flex items-center'>
                        <FiUser className='text-xl mr-2 text-gray-700' />
                        <span className={roleBadgeClass}>
                            Welcome, {displayName}
                        </span>
                    </div>

                    <div className='px-4 pt-4 pb-24 space-y-1 flex flex-col'>
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
                                <NavLink
                                    to='/demos/calendar'
                                    onClick={toggleMenu}
                                    className={navClass}
                                >
                                    Demos
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

                                        <div className='border-t border-gray-100 my-2 pt-2'>
                                            <span className='px-1 text-xs font-bold text-gray-400 uppercase tracking-wider'>
                                                System Management
                                            </span>
                                        </div>
                                        <Link
                                            to='/admin/demo-master'
                                            onClick={toggleMenu}
                                            className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors'
                                        >
                                            <FiMonitor /> Manage Demos
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
