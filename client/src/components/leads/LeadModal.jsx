import { FiMonitor, FiSearch, FiCheck } from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios.js'

const defaultFormState = {
	fullName: '',
	email: '',
	phone: '',
	city: '',
	source: '',
	channelPartner: '', // <-- Added
	status: '',
	experienceLevel: '',
	estimatedValue: 0,
	interestedCourses: [],
	assignedTo: '',
	nextFollowUpDate: '',
	lostReason: '',
}

const LeadModal = ({ isOpen, onClose, onSubmit, initialData, currentUser }) => {
	const [formData, setFormData] = useState(defaultFormState)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Standard Dropdowns
	const [availableCourses, setAvailableCourses] = useState([])
	const [availableSources, setAvailableSources] = useState([])
	const [availableStatuses, setAvailableStatuses] = useState([])
	const [availableExperiences, setAvailableExperiences] = useState([])
	const [availableUsers, setAvailableUsers] = useState([])
	const [availablePartners, setAvailablePartners] = useState([]) // <-- Added

	// Searchable Dropdown State for Partners
	const [partnerSearch, setPartnerSearch] = useState('')
	const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false)
	const partnerDropdownRef = useRef(null)

	// Demo Dropdowns & State
	const [demoMasters, setDemoMasters] = useState([])
	const [demoMasterId, setDemoMasterId] = useState('')
	const [demoDate, setDemoDate] = useState('')
	const [demoAssignee, setDemoAssignee] = useState('')
	const [demoSummary, setDemoSummary] = useState('')

	const roleName = (
		currentUser?.role?.name ||
		currentUser?.role ||
		''
	).toLowerCase()
	const isAdmin = roleName === 'admin'

	// Check if selected source is a Referral
	const isReferralSource = formData.source?.toLowerCase().includes('referral')

	// Close partner dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				partnerDropdownRef.current &&
				!partnerDropdownRef.current.contains(event.target)
			) {
				setIsPartnerDropdownOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () =>
			document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	useEffect(() => {
		const fetchDropdownData = async () => {
			try {
				const requests = [
					api.get('/courses'),
					api.get('/sources'),
					api.get('/statuses'),
					api.get('/experiences'),
					api.get('/demos/master'),
					api.get('/partners'), // Fetch active partners
				]
				if (isAdmin) requests.push(api.get('/users'))

				const responses = await Promise.all(requests)

				const courses = responses[0]?.data?.data || []
				const sources = responses[1]?.data?.data || []
				const statuses = responses[2]?.data?.data || []
				const experiences = responses[3]?.data?.data || []
				const demos = responses[4]?.data?.data || []
				const partners = responses[5]?.data?.data || []
				const users = isAdmin
					? responses[6]?.data?.data || responses[6]?.data || []
					: []

				setAvailableCourses(courses)
				setAvailableSources(sources)
				setAvailableStatuses(statuses)
				setAvailableExperiences(experiences)
				setDemoMasters(demos)
				setAvailablePartners(partners)
				if (isAdmin) setAvailableUsers(users)

				if (demos.length > 0) setDemoMasterId(demos[0]._id)
				setDemoAssignee(currentUser?._id || '')

				if (!initialData) {
					setFormData((prev) => ({
						...prev,
						source: prev.source || sources[0]?.name || '',
						status: prev.status || statuses[0]?.name || '',
						experienceLevel:
							prev.experienceLevel || experiences[0]?.name || '',
						assignedTo: currentUser?._id || '',
					}))
				}
			} catch (error) {
				console.error('Failed to fetch dropdown datasets:', error)
			}
		}
		if (isOpen) fetchDropdownData()
	}, [isOpen, isAdmin, initialData, currentUser])

	useEffect(() => {
		if (!isOpen) return
		if (initialData) {
			setFormData({
				...defaultFormState,
				...initialData,
				assignedTo:
					typeof initialData.assignedTo === 'object'
						? initialData.assignedTo?._id || ''
						: initialData.assignedTo || '',
				channelPartner:
					typeof initialData.channelPartner === 'object'
						? initialData.channelPartner?._id || ''
						: initialData.channelPartner || '',
				nextFollowUpDate: initialData.nextFollowUpDate
					? initialData.nextFollowUpDate.split('T')[0]
					: '',
				interestedCourses:
					initialData.interestedCourses?.map((course) =>
						typeof course === 'object' ? course._id : course,
					) || [],
				lostReason: initialData.lostReason || '',
				estimatedValue: Number(initialData.estimatedValue) || 0,
			})
			setDemoDate('')
			setDemoSummary('')

			// Set initial search term if editing a lead with a partner
			if (initialData.channelPartner) {
				const partnerObj =
					typeof initialData.channelPartner === 'object'
						? initialData.channelPartner
						: availablePartners.find(
								(p) => p._id === initialData.channelPartner,
							)
				if (partnerObj)
					setPartnerSearch(
						`${partnerObj.partnerName} (${partnerObj.uniqueCode})`,
					)
			}
		} else {
			setFormData({
				...defaultFormState,
				source: availableSources[0]?.name || '',
				status: availableStatuses[0]?.name || '',
				experienceLevel: availableExperiences[0]?.name || '',
				assignedTo: currentUser?._id || '',
			})
			setPartnerSearch('')
		}
	}, [
		isOpen,
		initialData,
		availableSources,
		availableStatuses,
		availableExperiences,
		currentUser,
		availablePartners,
	])

	const handleChange = (e) => {
		const { name, value, type, multiple, selectedOptions } = e.target
		if (multiple) {
			const values = Array.from(selectedOptions, (opt) => opt.value)
			setFormData((prev) => ({ ...prev, [name]: values }))
		} else {
			setFormData((prev) => ({
				...prev,
				[name]:
					type === 'number'
						? value === ''
							? ''
							: Number(value)
						: value,
			}))
		}
	}

	const selectPartner = (partner) => {
		setFormData((prev) => ({ ...prev, channelPartner: partner._id }))
		setPartnerSearch(`${partner.partnerName} (${partner.uniqueCode})`)
		setIsPartnerDropdownOpen(false)
	}

	const filteredPartners = availablePartners.filter(
		(p) =>
			p.partnerName.toLowerCase().includes(partnerSearch.toLowerCase()) ||
			p.uniqueCode.toLowerCase().includes(partnerSearch.toLowerCase()),
	)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setIsSubmitting(true)

		if (formData.status === 'DEMO_SCHEDULED' && !demoDate && !initialData) {
			alert('You must provide a Date & Time to schedule the demo.')
			setIsSubmitting(false)
			return
		}

		const payload = { ...formData }
		payload.estimatedValue = Number(payload.estimatedValue) || 0

		if (!payload.nextFollowUpDate) delete payload.nextFollowUpDate
		if (payload.status !== 'LOST') payload.lostReason = ''
		if (!payload.assignedTo) delete payload.assignedTo
		if (!isReferralSource) delete payload.channelPartner // Scrub if not a referral

		try {
			const savedLead = await onSubmit(payload)

			if (savedLead && payload.status === 'DEMO_SCHEDULED' && demoDate) {
				await api.post('/demos/schedule', {
					leadId: savedLead._id,
					demoMasterId,
					assignedTo: demoAssignee,
					scheduledDate: demoDate,
					summary:
						demoSummary || 'Demo Scheduled during Lead Creation',
				})
			}
		} catch (error) {
			console.error('Form submission failed:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6'>
			<div className='bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-full overflow-hidden'>
				<div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0'>
					<h2 className='text-xl font-bold text-gray-800'>
						{initialData ? 'Edit Lead' : 'Add New Lead'}
					</h2>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-gray-600 text-2xl leading-none'
					>
						&times;
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className='flex flex-col flex-1 overflow-hidden'
				>
					<div className='p-6 overflow-y-auto flex-1'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Full Name *
								</label>
								<input
									required
									type='text'
									name='fullName'
									value={formData.fullName}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Phone Number *
								</label>
								<input
									required
									type='text'
									name='phone'
									value={formData.phone}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Email
								</label>
								<input
									type='email'
									name='email'
									value={formData.email}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									City
								</label>
								<input
									type='text'
									name='city'
									value={formData.city}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Source
								</label>
								<select
									name='source'
									value={formData.source}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 bg-white outline-none'
								>
									{availableSources.map((s) => (
										<option key={s._id} value={s.name}>
											{s.label || s.name}
										</option>
									))}
								</select>
							</div>

							{/* CONDITIONAL CHANNEL PARTNER DROPDOWN */}
							{isReferralSource && (
								<div
									className='relative animate-fade-in-up'
									ref={partnerDropdownRef}
								>
									<label className='block text-sm font-medium text-green-700 mb-1'>
										Select Channel Partner *
									</label>
									<div className='relative'>
										<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
											<FiSearch className='text-gray-400' />
										</div>
										<input
											type='text'
											placeholder='Search partner name or code...'
											value={partnerSearch}
											required={
												isReferralSource &&
												!formData.channelPartner
											}
											onChange={(e) => {
												setPartnerSearch(e.target.value)
												setIsPartnerDropdownOpen(true)
												if (formData.channelPartner)
													setFormData((prev) => ({
														...prev,
														channelPartner: '',
													}))
											}}
											onClick={() =>
												setIsPartnerDropdownOpen(true)
											}
											className='w-full border border-green-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 outline-none bg-green-50/30'
										/>
									</div>
									{isPartnerDropdownOpen && (
										<div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
											{filteredPartners.length === 0 ? (
												<div className='px-4 py-3 text-sm text-gray-500 text-center'>
													No partners found
												</div>
											) : (
												<ul className='py-1'>
													{filteredPartners.map(
														(p) => (
															<li
																key={p._id}
																onClick={() =>
																	selectPartner(
																		p,
																	)
																}
																className='px-4 py-2 hover:bg-green-50 cursor-pointer flex justify-between items-center group'
															>
																<div>
																	<span className='block text-sm font-medium text-gray-900'>
																		{
																			p.partnerName
																		}
																	</span>
																	<span className='block text-xs text-gray-500'>
																		Code:{' '}
																		{
																			p.uniqueCode
																		}
																	</span>
																</div>
																{formData.channelPartner ===
																	p._id && (
																	<FiCheck className='text-green-600' />
																)}
															</li>
														),
													)}
												</ul>
											)}
										</div>
									)}
								</div>
							)}

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Status
								</label>
								<select
									name='status'
									value={formData.status}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 bg-white outline-none'
								>
									{availableStatuses.map((s) => (
										<option key={s._id} value={s.name}>
											{s.label || s.name}
										</option>
									))}
								</select>
							</div>

							{/* CONDITIONAL DEMO BLOCK */}
							{formData.status === 'DEMO_SCHEDULED' && (
								<div className='md:col-span-2 bg-purple-50 p-4 rounded-xl border border-purple-100 animate-fade-in-up mt-2'>
									<h3 className='text-sm font-bold text-purple-900 mb-3 flex items-center gap-2'>
										<FiMonitor /> Setup Demo Session
									</h3>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
										<div>
											<label className='block text-xs font-semibold text-purple-800 mb-1'>
												Select Topic
											</label>
											<select
												value={demoMasterId}
												onChange={(e) =>
													setDemoMasterId(
														e.target.value,
													)
												}
												className='w-full border border-purple-200 rounded-lg px-3 py-2 text-sm outline-none'
											>
												{demoMasters.map((d) => (
													<option
														key={d._id}
														value={d._id}
													>
														{d.title} (
														{d.durationMinutes}m)
													</option>
												))}
											</select>
										</div>
										<div>
											<label className='block text-xs font-semibold text-purple-800 mb-1'>
												Date & Time *
											</label>
											<input
												required={!initialData}
												type='datetime-local'
												value={demoDate}
												onChange={(e) =>
													setDemoDate(e.target.value)
												}
												className='w-full border border-purple-200 rounded-lg px-3 py-2 text-sm outline-none'
											/>
										</div>
									</div>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div>
											<label className='block text-xs font-semibold text-purple-800 mb-1'>
												Assign To
											</label>
											<select
												value={demoAssignee}
												onChange={(e) =>
													setDemoAssignee(
														e.target.value,
													)
												}
												className='w-full border border-purple-200 rounded-lg px-3 py-2 text-sm outline-none bg-white'
											>
												{availableUsers.map((u) => (
													<option
														key={u._id}
														value={u._id}
													>
														{u.firstName}{' '}
														{u.lastName}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className='block text-xs font-semibold text-purple-800 mb-1'>
												Demo Notes (Optional)
											</label>
											<input
												type='text'
												placeholder='Meeting link or notes'
												value={demoSummary}
												onChange={(e) =>
													setDemoSummary(
														e.target.value,
													)
												}
												className='w-full border border-purple-200 rounded-lg px-3 py-2 text-sm outline-none'
											/>
										</div>
									</div>
								</div>
							)}

							{formData.status === 'LOST' && (
								<div className='md:col-span-2 mt-2'>
									<label className='block text-sm font-medium text-red-700 mb-1'>
										Reason for Loss *
									</label>
									<input
										required
										type='text'
										name='lostReason'
										value={formData.lostReason}
										onChange={handleChange}
										placeholder='Briefly explain why this lead was lost'
										className='w-full border border-red-300 rounded-lg px-3 py-2 text-sm bg-red-50 outline-none'
									/>
								</div>
							)}

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Experience Level
								</label>
								<select
									name='experienceLevel'
									value={formData.experienceLevel}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 bg-white outline-none'
								>
									{availableExperiences.map((e) => (
										<option key={e._id} value={e.name}>
											{e.label || e.name}
										</option>
									))}
								</select>
							</div>
							{isAdmin && (
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Assign Lead To
									</label>
									<select
										name='assignedTo'
										value={formData.assignedTo}
										onChange={handleChange}
										className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 bg-white outline-none'
									>
										<option value={currentUser?._id || ''}>
											Assign to Me (Default)
										</option>
										{availableUsers.map((u) => (
											<option key={u._id} value={u._id}>
												{u.firstName} {u.lastName}
											</option>
										))}
									</select>
								</div>
							)}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Next Follow-Up Date
								</label>
								<input
									type='date'
									name='nextFollowUpDate'
									value={formData.nextFollowUpDate || ''}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Estimated Value (₹)
								</label>
								<input
									type='number'
									name='estimatedValue'
									value={formData.estimatedValue}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none'
								/>
							</div>
							<div className='md:col-span-2'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Interested Courses
								</label>
								<select
									multiple
									name='interestedCourses'
									value={formData.interestedCourses}
									onChange={handleChange}
									className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 bg-white outline-none'
									size={3}
								>
									{availableCourses.map((course) => (
										<option
											key={course._id}
											value={course._id}
										>
											{course.courseTitle} - ₹{course.fee}
										</option>
									))}
								</select>
								<p className='text-xs text-gray-400 mt-1'>
									Hold Ctrl (Windows) or Cmd (Mac) to select
									multiple.
								</p>
							</div>
						</div>
					</div>

					<div className='px-6 py-4 flex justify-end gap-3 border-t border-gray-100 bg-gray-50 shrink-0'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
						>
							{isSubmitting
								? 'Saving...'
								: formData.status === 'DEMO_SCHEDULED'
									? 'Save & Schedule Demo'
									: 'Save Lead'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default LeadModal
