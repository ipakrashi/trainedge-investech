import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiDollarSign, FiUser, FiBriefcase, FiCheckCircle } from 'react-icons/fi'

const PartnerPayouts = () => {
    const [payouts, setPayouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [settlingId, setSettlingId] = useState(null)
    const [utrRef, setUtrRef] = useState('')

    const fetchPayouts = async () => {
        try {
            setLoading(true)
            const userInfo = JSON.parse(localStorage.getItem('userInfo'))
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` },
            }
            const { data } = await axios.get('/api/partners/payouts', config)
            setPayouts(data.data || [])
            setLoading(false)
        } catch (err) {
            setError(err.response?.data?.message || err.message)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayouts()
    }, [])

    const handleSettle = async (partnerId) => {
        if (!utrRef.trim()) {
            alert('Please enter a valid Transaction Reference (UTR / Payout ID).')
            return
        }
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'))
            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}` 
                },
            }
            await axios.put(`/api/partners/${partnerId}/settle`, { transactionReference: utrRef }, config)
            setSettlingId(null)
            setUtrRef('')
            fetchPayouts()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Channel Partner Payout Ledgers</h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Monitor accrued commissions, reverse-GST breakdowns, and execute settlements.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className='text-center py-12 text-gray-500'>Loading payout records...</div>
            ) : error ? (
                <div className='bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm'>{error}</div>
            ) : payouts.length === 0 ? (
                <div className='bg-white shadow-sm border border-gray-200 rounded-xl p-12 text-center text-gray-400'>
                    No payout ledgers recorded yet.
                </div>
            ) : (
                <>
                    {/* --- DESKTOP TABLE VIEW (Medium screens and up) --- */}
                    <div className='hidden md:block bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full divide-y divide-gray-200 text-left text-sm'>
                                <thead className='bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[11px]'>
                                    <tr>
                                        <th className='py-3.5 px-4'>Partner</th>
                                        <th className='py-3.5 px-4'>Student</th>
                                        <th className='py-3.5 px-4'>Fee Collected</th>
                                        <th className='py-3.5 px-4'>Gross / Base Comm.</th>
                                        <th className='py-3.5 px-4'>GST Held</th>
                                        <th className='py-3.5 px-4'>Net Payable</th>
                                        <th className='py-3.5 px-4'>Status</th>
                                        <th className='py-3.5 px-4 text-right'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200 text-gray-700'>
                                    {payouts.map((item) => (
                                        <tr key={item._id} className='hover:bg-gray-50/50 transition-colors'>
                                            <td className='py-4 px-4 font-medium text-gray-900'>
                                                {item.partner?.partnerName || 'N/A'}
                                                <span className='block text-xs font-normal text-gray-400'>
                                                    {item.partner?.uniqueCode}
                                                </span>
                                            </td>
                                            <td className='py-4 px-4'>
                                                {item.student?.fullName || 'N/A'}
                                                <span className='block text-xs text-gray-400'>
                                                    {item.student?.phone}
                                                </span>
                                            </td>
                                            <td className='py-4 px-4 font-semibold text-gray-900'>
                                                ₹{item.totalFeeCollected?.toLocaleString()}
                                            </td>
                                            <td className='py-4 px-4'>
                                                ₹{item.commissionCalculation?.totalGrossCommission}
                                                <span className='block text-xs text-gray-400'>
                                                    Base: ₹{item.commissionCalculation?.baseCommission}
                                                </span>
                                            </td>
                                            <td className='py-4 px-4 text-gray-600'>
                                                ₹{item.commissionCalculation?.gstAmount}
                                                {item.partner?.taxProfile?.isGstApplicable && (
                                                    <span className='ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700'>
                                                        GST 18%
                                                    </span>
                                                )}
                                            </td>
                                            <td className='py-4 px-4 font-bold text-green-600'>
                                                ₹{item.commissionCalculation?.netPayableToPartner}
                                            </td>
                                            <td className='py-4 px-4'>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        item.status === 'PAID'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                                {item.transactionReference && (
                                                    <span className='block text-[10px] text-gray-400 mt-0.5'>
                                                        Ref: {item.transactionReference}
                                                    </span>
                                                )}
                                            </td>
                                            <td className='py-4 px-4 text-right'>
                                                {item.status === 'PENDING' && (
                                                    <div>
                                                        {settlingId === item.partner?._id ? (
                                                            <div className='flex items-center justify-end gap-2'>
                                                                <input
                                                                    type='text'
                                                                    placeholder='Enter UTR...'
                                                                    value={utrRef}
                                                                    onChange={(e) => setUtrRef(e.target.value)}
                                                                    className='w-32 px-2 py-1 text-xs border rounded focus:outline-blue-500'
                                                                />
                                                                <button
                                                                    onClick={() => handleSettle(item.partner?._id)}
                                                                    className='px-2.5 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700'
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => setSettlingId(null)}
                                                                    className='text-gray-400 hover:text-gray-600 text-xs'
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSettlingId(item.partner?._id)}
                                                                className='px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors'
                                                            >
                                                                Settle Partner
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- MOBILE STACKED CARD VIEW (Screens smaller than md) --- */}
                    <div className='md:hidden space-y-4'>
                        {payouts.map((item) => (
                            <div key={item._id} className='bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3'>
                                <div className='flex justify-between items-start border-b border-gray-100 pb-3'>
                                    <div>
                                        <h3 className='font-bold text-gray-900 text-base'>
                                            {item.partner?.partnerName || 'N/A'}
                                        </h3>
                                        <span className='text-xs text-gray-400 font-mono'>
                                            Code: {item.partner?.uniqueCode}
                                        </span>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            item.status === 'PAID'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                <div className='grid grid-cols-2 gap-2 text-xs text-gray-600'>
                                    <div>
                                        <span className='block text-gray-400'>Student:</span>
                                        <span className='font-medium text-gray-800'>{item.student?.fullName || 'N/A'}</span>
                                        <span className='block text-gray-400 text-[10px]'>{item.student?.phone}</span>
                                    </div>
                                    <div>
                                        <span className='block text-gray-400'>Fee Collected:</span>
                                        <span className='font-semibold text-gray-900'>₹{item.totalFeeCollected?.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className='block text-gray-400'>Gross / Base Comm:</span>
                                        <span className='font-medium'>₹{item.commissionCalculation?.totalGrossCommission}</span>
                                        <span className='block text-gray-400 text-[10px]'>(Base: ₹{item.commissionCalculation?.baseCommission})</span>
                                    </div>
                                    <div>
                                        <span className='block text-gray-400'>Net Payable:</span>
                                        <span className='font-bold text-green-600 text-sm'>₹{item.commissionCalculation?.netPayableToPartner}</span>
                                    </div>
                                </div>

                                {item.transactionReference && (
                                    <div className='text-xs text-gray-500 bg-gray-50 p-2 rounded'>
                                        <span className='font-semibold'>Ref:</span> {item.transactionReference}
                                    </div>
                                )}

                                {item.status === 'PENDING' && (
                                    <div className='pt-2 border-t border-gray-100 flex flex-col gap-2'>
                                        {settlingId === item.partner?._id ? (
                                            <div className='flex items-center gap-2'>
                                                <input
                                                    type='text'
                                                    placeholder='Enter UTR...'
                                                    value={utrRef}
                                                    onChange={(e) => setUtrRef(e.target.value)}
                                                    className='flex-1 px-3 py-1.5 text-xs border rounded focus:outline-blue-500'
                                                />
                                                <button
                                                    onClick={() => handleSettle(item.partner?._id)}
                                                    className='px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700'
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setSettlingId(null)}
                                                    className='text-gray-400 hover:text-gray-600 text-xs px-2'
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSettlingId(item.partner?._id)}
                                                className='w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors text-center'
                                            >
                                                Settle Partner
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default PartnerPayouts