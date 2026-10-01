// src/pages/feedback/ClientFeedback.jsx

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiStar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import api from '../../api/axios'

const ClientFeedback = () => {
    const { token } = useParams()
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comments, setComments] = useState('')
    const [status, setStatus] = useState('idle') // idle, submitting, success, error
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            setErrorMessage('Please select a star rating.')
            return
        }

        setStatus('submitting')
        setErrorMessage('')

        try {
            await api.post(`/demos/feedback/${token}`, {
                rating,
                clientComments: comments,
            })
            setStatus('success')
        } catch (err) {
            setStatus('error')
            setErrorMessage(
                err.response?.data?.message ||
                    'Something went wrong. This feedback link may have expired or already been used.',
            )
        }
    }

    if (status === 'success') {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
                <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100'>
                    <FiCheckCircle className='mx-auto h-16 w-16 text-green-500 mb-4' />
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                        Thank You!
                    </h2>
                    <p className='text-gray-600'>
                        Your feedback has been successfully submitted. We
                        appreciate your time and insights!
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
            <div className='max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100'>
                <div className='bg-blue-600 p-6 text-center'>
                    <h2 className='text-2xl font-bold text-white'>
                        Session Feedback
                    </h2>
                    <p className='text-blue-100 mt-1 text-sm'>
                        Let us know how your demo session went!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='p-6 space-y-6'>
                    {status === 'error' && (
                        <div className='bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 text-sm border border-red-100'>
                            <FiAlertCircle className='flex-shrink-0 mt-0.5 text-red-500' />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className='text-center'>
                        <label className='block text-sm font-bold text-gray-700 mb-3'>
                            How would you rate your session? *
                        </label>
                        <div className='flex justify-center gap-2'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type='button'
                                    className='focus:outline-none transition-transform hover:scale-110'
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <FiStar
                                        className={`h-10 w-10 ${
                                            star <= (hover || rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-bold text-gray-700 mb-2'>
                            Additional Comments
                        </label>
                        <textarea
                            rows='4'
                            placeholder='Tell us what you liked or how we can improve...'
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className='w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none'
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={status === 'submitting'}
                        className='w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center'
                    >
                        {status === 'submitting'
                            ? 'Submitting...'
                            : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ClientFeedback