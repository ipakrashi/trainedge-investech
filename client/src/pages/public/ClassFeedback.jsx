import { useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios' // Adjust the import path to your axios instance if needed
import { FiStar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

const ClassFeedback = () => {
	const { token } = useParams()
	const [rating, setRating] = useState(0)
	const [hoverRating, setHoverRating] = useState(0)
	const [comments, setComments] = useState('')
	const [status, setStatus] = useState('idle') // 'idle', 'submitting', 'success', 'error'
	const [errorMessage, setErrorMessage] = useState('')

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (rating === 0) {
			setStatus('error')
			setErrorMessage('Please select a star rating before submitting.')
			return
		}

		setStatus('submitting')
		setErrorMessage('')

		try {
			await api.post(`/demos/feedback/${token}`, {
				rating,
				comments,
			})
			setStatus('success')
		} catch (error) {
			setStatus('error')
			setErrorMessage(
				error.response?.data?.message ||
					'Something went wrong. This link may be invalid or already used.',
			)
		}
	}

	if (status === 'success') {
		return (
			<div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4'>
				<div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100'>
					<FiCheckCircle className='mx-auto h-16 w-16 text-green-500 mb-6' />
					<h2 className='text-2xl font-extrabold text-gray-900 mb-2'>
						Thank You!
					</h2>
					<p className='text-gray-600 mb-8'>
						Your feedback has been submitted successfully. We
						appreciate your input as it helps us improve our
						classes!
					</p>
					<div className='text-sm text-gray-400 font-medium'>
						You may now close this window.
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans'>
			<div className='max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100'>
				{/* Branding Header */}
				<div className='bg-blue-600 px-6 py-8 text-center'>
					<h1 className='text-2xl font-extrabold text-white tracking-tight'>
						trainEdge InvesTech
					</h1>
					<p className='text-blue-100 mt-2 text-sm font-medium'>
						Class Session Feedback
					</p>
				</div>

				<div className='p-6 sm:p-8'>
					<p className='text-center text-gray-600 mb-8 text-sm sm:text-base'>
						How would you rate today's class session? Your feedback
						is entirely confidential and helps us maintain high
						standards.
					</p>

					{status === 'error' && (
						<div className='mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-sm flex items-start border border-red-100'>
							<FiAlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
							<span>{errorMessage}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Interactive Star Rating */}
						<div className='flex justify-center gap-2 sm:gap-4'>
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type='button'
									onClick={() => setRating(star)}
									onMouseEnter={() => setHoverRating(star)}
									onMouseLeave={() => setHoverRating(0)}
									className='focus:outline-none transition-transform hover:scale-110'
								>
									<FiStar
										className={`h-10 w-10 sm:h-12 sm:w-12 transition-colors ${
											star <= (hoverRating || rating)
												? 'text-amber-400 fill-amber-400'
												: 'text-gray-200'
										}`}
									/>
								</button>
							))}
						</div>

						{/* Comments Textarea */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>
								Additional Comments (Optional)
							</label>
							<textarea
								rows='4'
								value={comments}
								onChange={(e) => setComments(e.target.value)}
								placeholder='What did you like? What could be improved?'
								className='w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none text-sm'
							/>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={status === 'submitting'}
							className='w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center'
						>
							{status === 'submitting' ? (
								<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
							) : (
								'Submit Feedback'
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}

export default ClassFeedback
