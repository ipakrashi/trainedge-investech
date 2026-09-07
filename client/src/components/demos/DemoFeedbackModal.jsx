// src/components/demos/DemoFeedbackModal.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiX, FiStar, FiMonitor, FiClock } from 'react-icons/fi'

const DemoFeedbackModal = ({ isOpen, onClose, session, onSuccess }) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comments, setComments] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setRating(0)
            setHoverRating(0)
            setComments('')
        }
    }, [isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) return alert('Please select a rating (1-5 stars).')
        if (!comments.trim())
            return alert('Please provide client feedback comments.')

        try {
            setIsSubmitting(true)
            await api.put(`/demos/schedule/${session._id}/complete`, {
                rating,
                clientComments: comments,
            })
            onSuccess() // Triggers timeline refresh
            onClose()
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    'Failed to complete demo session.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen || !session) return null

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-fade-in-up'>
                <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl'>
                    <h2 className='text-lg font-bold text-gray-900'>
                        Demo Session Feedback
                    </h2>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 text-2xl'
                    >
                        <FiX />
                    </button>
                </div>

                <div className='p-6'>
                    {/* Session Context Card */}
                    <div className='bg-purple-50 rounded-lg p-4 mb-6 border border-purple-100'>
                        <div className='flex items-center gap-2 font-semibold text-purple-900 mb-2'>
                            <FiMonitor />{' '}
                            {session.demoMaster?.title || 'Custom Walkthrough'}
                        </div>
                        <div className='text-sm text-purple-700 flex items-center gap-2'>
                            <FiClock />
                            {new Date(session.scheduledDate).toLocaleString(
                                'en-IN',
                                {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                },
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        {/* Interactive Star Rating */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Client Satisfaction Rating *
                            </label>
                            <div className='flex items-center gap-2'>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type='button'
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() => setHoverRating(0)}
                                        className='focus:outline-none transition-transform hover:scale-110'
                                    >
                                        <FiStar
                                            size={28}
                                            className={`${
                                                (hoverRating || rating) >= star
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-gray-300'
                                            } transition-colors`}
                                        />
                                    </button>
                                ))}
                                <span className='ml-3 text-sm font-medium text-gray-500'>
                                    {rating > 0
                                        ? `${rating} / 5 Stars`
                                        : 'Select rating'}
                                </span>
                            </div>
                        </div>

                        {/* Comments Textarea */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Client Remarks & Next Steps *
                            </label>
                            <textarea
                                required
                                rows='4'
                                placeholder='Detail the client’s reaction, concerns, and agreed next steps...'
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-purple-500 focus:border-purple-500 outline-none resize-none'
                            />
                        </div>

                        <div className='flex justify-end gap-3 pt-2'>
                            <button
                                type='button'
                                onClick={onClose}
                                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm'
                            >
                                {isSubmitting
                                    ? 'Saving...'
                                    : 'Save Feedback & Complete'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default DemoFeedbackModal
