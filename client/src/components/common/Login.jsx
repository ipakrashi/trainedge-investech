import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const response = await axios.post(
                '/api/users/login',
                { email, password },
                {
                    // CRUCIAL: This tells Axios to accept the HTTP-only cookie from the server
                    withCredentials: true,
                },
            )

            // Store basic user info in local storage
            // DO NOT store the token here, the browser handles the cookie automatically!
            localStorage.setItem('userInfo', JSON.stringify(response.data))

            // Redirect to dashboard on success
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                <div className='text-center mb-8'>
                    <div className='flex items-center justify-center mb-4'>
                        <img
                            src='/Logo_final-NOBG.png'
                            alt='trainEdge InvesTech Logo'
                            className='h-16 object-contain'
                        />
                    </div>
                    <h2 className='text-2xl font-extrabold text-gray-900 tracking-tight'>
                        trainEdge CORe
                    </h2>
                    <p className='mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest'>
                        Conversion • Operations • Roster
                    </p>
                </div>

                {error && (
                    <div className='bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6 font-medium border border-red-100'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className='space-y-5'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Email Address
                        </label>
                        <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FiMail className='text-gray-400' />
                            </div>
                            <input
                                type='email'
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                                placeholder='you@investech.com'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Password
                        </label>
                        <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FiLock className='text-gray-400' />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='pl-10 pr-12 w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
                                placeholder='••••••••'
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors'
                            >
                                {showPassword ? (
                                    <FiEyeOff size={18} />
                                ) : (
                                    <FiEye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className='w-full flex justify-center items-center py-2.5 px-4 mt-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all'
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                >
                                    <circle
                                        className='opacity-25'
                                        cx='12'
                                        cy='12'
                                        r='10'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                    ></circle>
                                    <path
                                        className='opacity-75'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                    ></path>
                                </svg>
                                Authenticating...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
