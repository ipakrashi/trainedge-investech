import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiPlus, FiBriefcase, FiPercent } from 'react-icons/fi'

const ChannelPartnerManagement = () => {
	const [partners, setPartners] = useState([])
	const [loading, setLoading] = useState(true)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [formData, setFormData] = useState({
		partnerName: '',
		uniqueCode: '',
		commissionType: 'PERCENTAGE',
		commissionValue: 0,
		taxProfile: { isGstApplicable: false, gstNumber: '' },
		contactDetails: { email: '', phone: '', address: '' },
		bankDetails: {
			accountName: '',
			accountNumber: '',
			bankName: '',
			ifscCode: '',
		},
	})

	const fetchPartners = async () => {
		try {
			setLoading(true)
			const userInfo = JSON.parse(localStorage.getItem('userInfo'))
			const { data } = await axios.get('/api/partners', {
				headers: { Authorization: `Bearer ${userInfo?.token}` },
			})
			setPartners(data.data || [])
			setLoading(false)
		} catch (error) {
			console.error(error)
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchPartners()
	}, [])

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target

		if (name.includes('.')) {
			const [section, field] = name.split('.')
			setFormData((prev) => ({
				...prev,
				[section]: {
					...prev[section],
					[field]: type === 'checkbox' ? checked : value,
				},
			}))
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === 'number' ? Number(value) : value,
			}))
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			const userInfo = JSON.parse(localStorage.getItem('userInfo'))
			await axios.post('/api/partners', formData, {
				headers: { Authorization: `Bearer ${userInfo?.token}` },
			})
			setIsModalOpen(false)
			setFormData({
				partnerName: '',
				uniqueCode: '',
				commissionType: 'PERCENTAGE',
				commissionValue: 0,
				taxProfile: { isGstApplicable: false, gstNumber: '' },
				contactDetails: { email: '', phone: '', address: '' },
				bankDetails: {
					accountName: '',
					accountNumber: '',
					bankName: '',
					ifscCode: '',
				},
			})
			fetchPartners()
		} catch (error) {
			alert(error.response?.data?.message || 'Failed to create partner')
		}
	}

	return (
		<div className='max-w-7xl mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-8'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900'>
						Channel Partners
					</h1>
					<p className='text-sm text-gray-500'>
						Register and manage referring agency networks.
					</p>
				</div>
				<button
					onClick={() => setIsModalOpen(true)}
					className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700'
				>
					<FiPlus /> New Partner
				</button>
			</div>

			{loading ? (
				<div className='text-center py-12 text-gray-500'>
					Loading partners...
				</div>
			) : (
				<div className='bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden'>
					<table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
						<thead className='bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[11px]'>
							<tr>
								<th className='py-3.5 px-4'>Partner Entity</th>
								<th className='py-3.5 px-4'>Contact</th>
								<th className='py-3.5 px-4'>
									Commission terms
								</th>
								<th className='py-3.5 px-4'>Tax Profile</th>
								<th className='py-3.5 px-4'>Status</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200 text-gray-700'>
							{partners.map((p) => (
								<tr key={p._id} className='hover:bg-gray-50'>
									<td className='py-4 px-4 font-medium text-gray-900'>
										<div className='flex items-center gap-2'>
											<FiBriefcase className='text-gray-400' />
											<div>
												{p.partnerName}
												<span className='block text-xs font-mono text-gray-400'>
													{p.uniqueCode}
												</span>
											</div>
										</div>
									</td>
									<td className='py-4 px-4 text-xs'>
										<span className='block'>
											{p.contactDetails?.phone}
										</span>
										<span className='block text-gray-400'>
											{p.contactDetails?.email}
										</span>
									</td>
									<td className='py-4 px-4'>
										<span className='inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded'>
											{p.commissionType ===
											'PERCENTAGE' ? (
												<>
													<FiPercent className='text-[10px]' />{' '}
													{p.commissionValue}%
												</>
											) : (
												`₹${p.commissionValue} Flat`
											)}
										</span>
									</td>
									<td className='py-4 px-4 text-xs'>
										{p.taxProfile?.isGstApplicable ? (
											<span className='text-green-600 font-medium'>
												GST: {p.taxProfile.gstNumber}
											</span>
										) : (
											<span className='text-gray-400'>
												Unregistered
											</span>
										)}
									</td>
									<td className='py-4 px-4'>
										<span
											className={`px-2 py-1 text-[10px] font-semibold rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
										>
											{p.isActive ? 'ACTIVE' : 'INACTIVE'}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{isModalOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
					<div className='bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col'>
						<div className='px-6 py-4 border-b flex justify-between items-center'>
							<h2 className='text-lg font-bold'>
								Register Channel Partner
							</h2>
							<button
								onClick={() => setIsModalOpen(false)}
								className='text-gray-400 hover:text-gray-600'
							>
								&times;
							</button>
						</div>
						<form
							onSubmit={handleSubmit}
							className='p-6 overflow-y-auto space-y-4'
						>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Partner Name *
									</label>
									<input
										required
										type='text'
										name='partnerName'
										value={formData.partnerName}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								</div>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Unique Code *
									</label>
									<input
										required
										type='text'
										name='uniqueCode'
										value={formData.uniqueCode}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm uppercase'
									/>
								</div>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Commission Type
									</label>
									<select
										name='commissionType'
										value={formData.commissionType}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									>
										<option value='PERCENTAGE'>
											Percentage (%)
										</option>
										<option value='FIXED'>
											Fixed Fee (₹)
										</option>
									</select>
								</div>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Value *
									</label>
									<input
										required
										type='number'
										name='commissionValue'
										value={formData.commissionValue}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								</div>
							</div>
							<div className='border-t pt-4 grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Phone
									</label>
									<input
										type='text'
										name='contactDetails.phone'
										value={formData.contactDetails.phone}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								</div>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Email
									</label>
									<input
										type='email'
										name='contactDetails.email'
										value={formData.contactDetails.email}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								</div>
							</div>
							<div className='border-t pt-4'>
								<label className='flex items-center gap-2 text-sm font-semibold mb-3'>
									<input
										type='checkbox'
										name='taxProfile.isGstApplicable'
										checked={
											formData.taxProfile.isGstApplicable
										}
										onChange={handleChange}
									/>
									GST Registered Entity
								</label>
								{formData.taxProfile.isGstApplicable && (
									<input
										type='text'
										placeholder='GSTIN Number'
										name='taxProfile.gstNumber'
										value={formData.taxProfile.gstNumber}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								)}
							</div>
							<div className='border-t pt-4 grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Account Name
									</label>
									<input
										type='text'
										name='bankDetails.accountName'
										value={formData.bankDetails.accountName}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								</div>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Account Number
									</label>
									<input
										type='text'
										name='bankDetails.accountNumber'
										value={
											formData.bankDetails.accountNumber
										}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								</div>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										Bank Name
									</label>
									<input
										type='text'
										name='bankDetails.bankName'
										value={formData.bankDetails.bankName}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								</div>
								<div>
									<label className='block text-xs font-semibold mb-1'>
										IFSC Code
									</label>
									<input
										type='text'
										name='bankDetails.ifscCode'
										value={formData.bankDetails.ifscCode}
										onChange={handleChange}
										className='w-full border rounded px-3 py-2 text-sm'
									/>
								</div>
							</div>
							<button
								type='submit'
								className='w-full bg-blue-600 text-white font-medium py-2 rounded mt-4'
							>
								Register Partner
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default ChannelPartnerManagement
