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

    return (
        <footer className='bg-gray-900 text-gray-300 py-10'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Top Section: Grid Layout */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
                    {/* Brand & Description */}
                    <div>
                        <h2 className='text-2xl font-bold text-white mb-4 tracking-tight'>
                            <img
                                src={'Logo_final-NOBG.png'}
                                alt='Logo'
                                className='w-20'
                            />
                            {/* Investech LMS */}
                        </h2>
                        <p className='text-gray-400 text-sm leading-relaxed mb-4'>
                            Streamlining lead tracking, pipeline management, and
                            conversion analytics for modern sales teams.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='text-lg font-semibold text-white mb-4'>
                            Product
                        </h3>
                        <ul className='space-y-2 text-sm'>
                            <li>
                                <Link
                                    to='/dashboard'
                                    className='hover:text-blue-400 transition-colors'
                                >
                                    Dashboard
                                </Link>
                            </li>
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
                                    Sales Pipeline
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/reports'
                                    className='hover:text-blue-400 transition-colors'
                                >
                                    Analytics & Reports
                                </Link>
                            </li>
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
                                    to='/help'
                                    className='hover:text-blue-400 transition-colors'
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/api-docs'
                                    className='hover:text-blue-400 transition-colors'
                                >
                                    API Documentation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/privacy'
                                    className='hover:text-blue-400 transition-colors'
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/terms'
                                    className='hover:text-blue-400 transition-colors'
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
                                    href='mailto:support@investech.com'
                                    className='hover:text-blue-400 transition-colors'
                                >
                                    support@investech.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Socials */}
                <div className='border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center'>
                    <p className='text-sm text-gray-500 mb-4 md:mb-0'>
                        &copy; {currentYear} Investech Solutions. All rights
                        reserved.
                    </p>

                    <div className='flex space-x-4'>
                        <a
                            href='https://twitter.com'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-gray-400 hover:text-white transition-colors'
                            aria-label='Twitter'
                        >
                            <FiTwitter className='text-xl' />
                        </a>
                        <a
                            href='https://linkedin.com'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-gray-400 hover:text-white transition-colors'
                            aria-label='LinkedIn'
                        >
                            <FiLinkedin className='text-xl' />
                        </a>
                        <a
                            href='https://github.com'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-gray-400 hover:text-white transition-colors'
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
