import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { FiMail, FiLock } from 'react-icons/fi'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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

            // Store basic user info in local storage or state management (Redux)
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
            <div className='max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100'>
                <div className='text-center mb-8'>
                    <div className='flex items-center justify-center'>
                        <img
                            src='/Logo_final-NOBG.png'
                            alt='Logo'
                            className='h-15'
                        />
                    </div>
                    <h2 className='text-3xl font-bold text-gray-900 tracking-tight'>
                        trainEdge CORe
                    </h2>
                    <p className='mt-2 text-sm text-gray-600'>
                        Sign in to your account
                    </p>
                </div>

                {error && (
                    <div className='bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className='space-y-6'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Email Address
                        </label>
                        <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FiMail className='text-gray-400' />
                            </div>
                            <input
                                type='email'
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                                placeholder='you@investech.com'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Password
                        </label>
                        <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FiLock className='text-gray-400' />
                            </div>
                            <input
                                type='password'
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                                placeholder='••••••••'
                            />
                        </div>
                    </div>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className='w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors'
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
