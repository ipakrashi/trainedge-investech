import { useState } from 'react'
import {
	FiX,
	FiStar,
	FiCopy,
	FiCheck,
	FiMessageCircle,
	FiExternalLink,
} from 'react-icons/fi'

const DemoReviewModal = ({ isOpen, onClose, demo }) => {
	const [copied, setCopied] = useState(false)

	if (!isOpen || !demo) return null

	const frontendUrl =
		import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'
	const feedbackUrl = `${frontendUrl}/feedback/${demo.feedbackToken}`
	const clientName = demo.lead?.fullName || demo.lead?.firstName || 'Client'
	const clientPhone = demo.lead?.phone || ''

	const handleCopy = () => {
		navigator.clipboard.writeText(feedbackUrl)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handleWhatsAppShare = () => {
		const message = encodeURIComponent(
			`Hi ${clientName}, thank you for attending the Masterclass on Options Training today! Please share your feedback with us here: ${feedbackUrl}`,
		)
		window.open(`https://wa.me/${clientPhone}?text=${message}`, '_blank')
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100'>
				<div className='bg-purple-600 px-6 py-4 flex justify-between items-center text-white'>
					<h3 className='font-bold text-lg'>
						Session Review & Share
					</h3>
					<button
						onClick={onClose}
						className='text-purple-200 hover:text-white'
					>
						<FiX className='h-6 w-6' />
					</button>
				</div>

				<div className='p-6 space-y-6'>
					{/* Session Summary */}
					<div className='bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-sm'>
						<div className='flex justify-between'>
							<span className='text-gray-500'>Lead:</span>
							<span className='font-semibold text-gray-900'>
								{clientName}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-gray-500'>Topic:</span>
							<span className='font-semibold text-gray-900'>
								{demo.demoMaster?.title || 'Custom Walkthrough'}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-gray-500'>Status:</span>
							<span
								className={`font-semibold ${demo.status === 'COMPLETED' ? 'text-green-600' : 'text-purple-600'}`}
							>
								{demo.status}
							</span>
						</div>
					</div>

					{/* Rating & Comments Section */}
					{demo.status === 'COMPLETED' ? (
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-bold text-gray-700'>
									Client Rating:
								</span>
								<div className='flex items-center gap-1'>
									{demo.rating ? (
										<>
											<FiStar className='text-amber-400 fill-amber-400 h-5 w-5' />
											<span className='font-bold text-gray-900'>
												{demo.rating} / 5
											</span>
										</>
									) : (
										<span className='text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium'>
											Pending Client Submission
										</span>
									)}
								</div>
							</div>

							<div>
								<label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
									Client Comments
								</label>
								<div className='bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 italic min-h-[70px]'>
									{demo.clientComments
										? `"${demo.clientComments}"`
										: 'No comments provided by client yet.'}
								</div>
							</div>
						</div>
					) : (
						<div className='text-center py-4 bg-blue-50 text-blue-700 rounded-xl text-sm'>
							This demo is scheduled. Feedback link becomes fully
							active upon completion.
						</div>
					)}

					{/* Manual Link Sharing / WhatsApp Guard */}
					{demo.feedbackToken && !demo.feedbackTokenUsed && (
						<div className='space-y-3 pt-2 border-t border-gray-100'>
							<label className='block text-xs font-bold text-gray-700 uppercase tracking-wider'>
								Manual Feedback Link (WhatsApp / SMS Guard)
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
									className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-sm'
								>
									<FiMessageCircle className='h-5 w-5' />
									Send via WhatsApp
								</button>
							)}
						</div>
					)}
				</div>

				<div className='bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end'>
					<button
						onClick={onClose}
						className='bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}

export default DemoReviewModal
