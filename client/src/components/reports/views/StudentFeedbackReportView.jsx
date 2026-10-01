// src/components/reports/views/StudentFeedbackReportView.jsx
import {
	FiBookOpen,
	FiStar,
	FiCheckSquare,
	FiMessageCircle,
} from 'react-icons/fi'
import StatCard from '../../common/StatCard'

const StudentFeedbackReportView = ({ feedbackData }) => {
	const metrics = feedbackData?.metrics || {}
	const batchPerformance = feedbackData?.batchPerformance || []
	const facultyPerformance = feedbackData?.facultyPerformance || []

	const renderRatingBadge = (rating) => {
		if (!rating || rating <= 0) {
			return (
				<span className='text-gray-400 text-xs font-medium'>
					Unrated
				</span>
			)
		}
		return (
			<span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200'>
				<FiStar className='text-amber-500 fill-current text-xs' />
				<span>{rating} / 5</span>
			</span>
		)
	}

	return (
		<div className='space-y-6 sm:space-y-8'>
			{/* Macro Metrics Strip */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
				<StatCard
					title='Total Sessions Logged'
					value={metrics.totalSessions ?? 0}
					icon={FiCheckSquare}
					colorClass='bg-blue-50 text-blue-600'
				/>
				<StatCard
					title='Total Feedbacks Received'
					value={metrics.totalFeedbacks ?? 0}
					icon={FiMessageCircle}
					colorClass='bg-green-50 text-green-600'
				/>
				<StatCard
					title='Average Class Rating'
					value={
						metrics.averageRating
							? `${metrics.averageRating} / 5`
							: '-'
					}
					icon={FiStar}
					colorClass='bg-amber-50 text-amber-600'
				/>
			</div>

			{/* Performance Grids Container */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
				{/* 1. FACULTY PERFORMANCE */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
					<div className='px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between'>
						<h3 className='font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2'>
							Faculty Ratings Leaderboard
						</h3>
						<span className='text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full'>
							{facultyPerformance.length} Faculty
						</span>
					</div>

					<div className='hidden md:block overflow-x-auto'>
						<table className='w-full text-left border-collapse'>
							<thead>
								<tr className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-100 bg-white'>
									<th className='px-6 py-4'>Faculty Name</th>
									<th className='px-6 py-4 text-center'>
										Sessions Logged
									</th>
									<th className='px-6 py-4 text-center'>
										Avg Rating
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-100 text-sm'>
								{facultyPerformance.length > 0 ? (
									facultyPerformance.map((fac, i) => (
										<tr
											key={i}
											className='hover:bg-gray-50 transition-colors'
										>
											<td className='px-6 py-4 font-semibold text-gray-800'>
												{fac.name}
											</td>
											<td className='px-6 py-4 text-center text-gray-600 font-medium'>
												{fac.sessionCount}
											</td>
											<td className='px-6 py-4 text-center'>
												{renderRatingBadge(
													fac.avgRating,
												)}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan='3'
											className='px-6 py-8 text-center text-xs text-gray-400'
										>
											No faculty feedback data available.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* 2. BATCH PERFORMANCE */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
					<div className='px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between'>
						<h3 className='font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2'>
							Cohort / Batch Ratings
						</h3>
						<span className='text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full'>
							{batchPerformance.length} Batches
						</span>
					</div>

					<div className='hidden md:block overflow-x-auto'>
						<table className='w-full text-left border-collapse'>
							<thead>
								<tr className='text-xs uppercase tracking-wider text-gray-900 font-bold border-b border-gray-100 bg-white'>
									<th className='px-6 py-4'>Batch Name</th>
									<th className='px-6 py-4 text-center'>
										Sessions
									</th>
									<th className='px-6 py-4 text-center'>
										Avg Rating
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-100 text-sm'>
								{batchPerformance.length > 0 ? (
									batchPerformance.map((batch, i) => (
										<tr
											key={i}
											className='hover:bg-gray-50 transition-colors'
										>
											<td className='px-6 py-4 font-semibold text-gray-800'>
												<div className='flex items-center gap-2'>
													<FiBookOpen className='text-blue-500' />
													{batch.title}
												</div>
											</td>
											<td className='px-6 py-4 text-center text-gray-600 font-medium'>
												{batch.sessionCount}
											</td>
											<td className='px-6 py-4 text-center'>
												{renderRatingBadge(
													batch.avgRating,
												)}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan='3'
											className='px-6 py-8 text-center text-xs text-gray-400'
										>
											No cohort feedback data available.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentFeedbackReportView
