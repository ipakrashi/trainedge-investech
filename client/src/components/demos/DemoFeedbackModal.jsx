import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
	FiX,
	FiMonitor,
	FiClock,
	FiCheckCircle,
	FiCopy,
	FiCheck,
	FiMessageCircle,
} from 'react-icons/fi'

const DemoFeedbackModal = ({ isOpen, onClose, session, onSuccess }) => {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [completedData, setCompletedData] = useState(null)
	const [copied, setCopied] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setCompletedData(null)
			setCopied(false)
		}
	}, [isOpen])

	if (!isOpen || !session) return null

	const frontendUrl =
		typeof window !== 'undefined'
			? window.location.origin
			: 'https://trainedge-investech.onrender.com'
	const feedbackUrl = completedData?.feedbackToken
		? `${frontendUrl}/feedback/${completedData.feedbackToken}`
		: ''
	const clientName =
		session.lead?.fullName || session.lead?.firstName || 'Client'
	const clientPhone = session.lead?.phone || ''

	const handleComplete = async () => {
		try {
			setIsSubmitting(true)
			const { data } = await api.put(
				`/demos/schedule/${session._id}/complete`,
			)
			setCompletedData(data.data)
			onSuccess() // Refreshes timeline/calendar
		} catch (error) {
			alert(
				error.response?.data?.message ||
					'Failed to complete demo session.',
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCopy = () => {
		navigator.clipboard.writeText(feedbackUrl)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handleWhatsAppShare = () => {
		const message = encodeURIComponent(
			`Hi ${clientName}, thank you for attending the demo session today! Please share your feedback with us here: ${feedbackUrl}`,
		)
		window.open(`https://wa.me/${clientPhone}?text=${message}`, '_blank')
	}

	const handleCloseModal = () => {
		setCompletedData(null)
		onClose()
	}

	return (
		<div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
			<div className='bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>
				<div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50'>
					<h2 className='text-lg font-bold text-gray-900'>
						{completedData
							? 'Demo Completed & Link Generated'
							: 'Complete Demo Session'}
					</h2>
					<button
						onClick={handleCloseModal}
						className='text-gray-400 hover:text-gray-600 text-2xl'
					>
						<FiX />
					</button>
				</div>

				<div className='p-6 space-y-6'>
					{/* Session Context Card */}
					<div className='bg-purple-50 rounded-lg p-4 border border-purple-100'>
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

					{!completedData ? (
						<div className='space-y-6'>
							<p className='text-sm text-gray-600'>
								Marking this demo as complete will automatically
								dispatch a secure review solicitation email to{' '}
								<strong>{clientName}</strong> (
								{session.lead?.email || 'No email'}).
							</p>

							<div className='flex justify-end gap-3 pt-2'>
								<button
									type='button'
									onClick={handleCloseModal}
									className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
								>
									Cancel
								</button>
								<button
									type='button'
									onClick={handleComplete}
									disabled={isSubmitting}
									className='px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2'
								>
									<FiCheckCircle />
									{isSubmitting
										? 'Processing...'
										: 'Mark Complete & Send Email'}
								</button>
							</div>
						</div>
					) : (
						<div className='space-y-5'>
							<div className='bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-1'>
								<FiCheckCircle className='mx-auto h-8 w-8 text-green-600 mb-2' />
								<h4 className='font-bold text-green-900'>
									Demo Marked Complete Successfully!
								</h4>
								<p className='text-xs text-green-700'>
									Review solicitation email has been
									dispatched to the client. You can also share
									the direct link via WhatsApp below as a
									backup.
								</p>
							</div>

							<div className='space-y-2'>
								<label className='block text-xs font-bold text-gray-700 uppercase tracking-wider'>
									Generated WhatsApp Feedback Link
								</label>
								<div className='flex items-center gap-2'>
									<input
										type='text'
										readOnly
										value={feedbackUrl}
										className='w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none'
									/>
									<button
										onClick={handleCopy}
										className='flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors'
									>
										{copied ? (
											<FiCheck className='text-green-600' />
										) : (
											<FiCopy />
										)}
										{copied ? 'Copied' : 'Copy'}
									</button>
								</div>

								{clientPhone && (
									<button
										onClick={handleWhatsAppShare}
										className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-sm mt-3'
									>
										<FiMessageCircle className='h-5 w-5' />
										Send via WhatsApp Now
									</button>
								)}
							</div>

							<div className='flex justify-end pt-3'>
								<button
									type='button'
									onClick={handleCloseModal}
									className='px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm'
								>
									Done
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default DemoFeedbackModal
