// src/components/common/Footer.jsx
import { Link } from 'react-router-dom'
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiTwitter,
    FiLinkedin,
    FiGithub,
} from 'react-icons/fi'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    // 1. Retrieve user data from local storage
    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null

    // 2. Safely parse the role
    const userRole = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()

    // 3. Define access flags
    const isAdmin = userRole === 'admin'
    const isFaculty = userRole === 'faculty'
    const isSales = userRole === 'sales'
    const isAccounts = userRole === 'accounts'

    return (
        <footer className='bg-gray-900 text-gray-300 py-10 mt-auto'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Top Section: Grid Layout */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
                    {/* Brand & Description */}
                    <div>
                        <h2 className='text-2xl font-bold text-white mb-4 tracking-tight'>
                            <img
                                src={'/Logo_final-NOBG.png'}
                                alt='Logo'
                                className='w-20'
                            />
                        </h2>
                        <p className='text-gray-400 text-sm leading-relaxed mb-4'>
                            The integrated Conversion, Operations and Roster
                            ecosystem powering modern financial education
                            institute.
                        </p>
                    </div>

                    {/* Quick Links (Dynamic based on Role) */}
                    <div>
                        <h3 className='text-lg font-semibold text-white mb-4'>
                            Product
                        </h3>
                        <ul className='space-y-2 text-sm'>
                            {/* Sales & Admin Links */}
                            {(isAdmin || isSales) && (
                                <>
                                    <li>
                                        <Link
                                            to='/leads'
                                            className='hover:text-blue-400 transition-colors'
                                        >
                                            Lead Management
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to='/pipeline'
                                            className='hover:text-blue-400 transition-colors'
                                        >
                                            Pipeline Dashboard
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Academic Links (Faculty & Admin) */}
                            {(isAdmin || isFaculty) && (
                                <>
                                    <li>
                                        <Link
                                            to='/students'
                                            className='hover:text-blue-400 transition-colors'
                                        >
                                            Student Roster
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to='/batches'
                                            className='hover:text-blue-400 transition-colors'
                                        >
                                            Batches & Cohorts
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Admin Only Operations */}
                            {isAdmin && (
                                <li>
                                    <Link
                                        to='/admin/pending-students'
                                        className='hover:text-blue-400 transition-colors'
                                    >
                                        Pending Enrollments
                                    </Link>
                                </li>
                            )}

                            {/* Finance Links (Accounts & Admin) */}
                            {(isAdmin || isAccounts) && (
                                <li>
                                    <Link
                                        to='/admin/payments'
                                        className='hover:text-blue-400 transition-colors'
                                    >
                                        Fee Payments Ledger
                                    </Link>
                                </li>
                            )}

                            {/* Reporting (Admin, Sales, Accounts) */}
                            {(isAdmin || isSales || isAccounts) && (
                                <li>
                                    <Link
                                        to='/reports'
                                        className='hover:text-blue-400 transition-colors'
                                    >
                                        Institute Analytics
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h3 className='text-lg font-semibold text-white mb-4'>
                            Support
                        </h3>
                        <ul className='space-y-2 text-sm'>
                            <li>
                                <Link
                                    to='#'
                                    className='hover:text-blue-400 transition-colors cursor-default'
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='#'
                                    className='hover:text-blue-400 transition-colors cursor-default'
                                >
                                    API Documentation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='#'
                                    className='hover:text-blue-400 transition-colors cursor-default'
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='#'
                                    className='hover:text-blue-400 transition-colors cursor-default'
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className='text-lg font-semibold text-white mb-4'>
                            Contact Us
                        </h3>
                        <ul className='space-y-3 text-sm'>
                            <li className='flex items-start'>
                                <FiMapPin className='text-lg mr-2 mt-0.5 flex-shrink-0 text-blue-400' />
                                <span>
                                    69A Ballygunge Place
                                    <br />
                                    Kolkata, WB 700019
                                </span>
                            </li>
                            <li className='flex items-center'>
                                <FiPhone className='text-lg mr-2 flex-shrink-0 text-blue-400' />
                                <span>+91 98300 25037</span>
                            </li>
                            <li className='flex items-center'>
                                <FiMail className='text-lg mr-2 flex-shrink-0 text-blue-400' />
                                <a
                                    href='mailto:support@trainedge.com'
                                    className='hover:text-blue-400 transition-colors'
                                >
                                    support@trainedge.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Socials */}
                <div className='border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center'>
                    <p className='text-sm text-gray-500 mb-4 md:mb-0'>
                        &copy; {currentYear} trainEdge InvesTech. All rights
                        reserved.
                    </p>

                    <div className='flex space-x-4'>
                        <a
                            href='#'
                            className='text-gray-400 hover:text-white transition-colors cursor-default'
                            aria-label='Twitter'
                        >
                            <FiTwitter className='text-xl' />
                        </a>
                        <a
                            href='#'
                            className='text-gray-400 hover:text-white transition-colors cursor-default'
                            aria-label='LinkedIn'
                        >
                            <FiLinkedin className='text-xl' />
                        </a>
                        <a
                            href='#'
                            className='text-gray-400 hover:text-white transition-colors cursor-default'
                            aria-label='GitHub'
                        >
                            <FiGithub className='text-xl' />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
