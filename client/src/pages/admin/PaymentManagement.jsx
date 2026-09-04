// src/pages/admin/PaymentManagement.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
    FiPlus,
    FiDollarSign,
    FiCalendar,
    FiUser,
    FiCreditCard,
} from 'react-icons/fi'
import RecordPaymentModal from '../../components/admin/RecordPaymentModal'

const PaymentManagement = () => {
    const [payments, setPayments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchPayments = async () => {
        try {
            const res = await api.get('/payments')
            setPayments(res.data?.data || [])
        } catch (error) {
            console.error('Failed to fetch payments:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        )
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                            Fee Payments & Ledger
                        </h1>
                        <p className='text-sm text-gray-500 mt-1'>
                            Track all student course fee transactions and
                            collection records.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors'
                    >
                        <FiPlus className='text-lg' /> Record New Payment
                    </button>
                </div>

                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100'>
                                    <th className='px-6 py-4 font-medium'>
                                        Transaction / Date
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Student
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Amount Received
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Payment Mode
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Collected By
                                    </th>
                                    <th className='px-6 py-4 font-medium'>
                                        Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {payments.map((p) => (
                                    <tr
                                        key={p._id}
                                        className='hover:bg-gray-50'
                                    >
                                        <td className='px-6 py-4'>
                                            <div className='font-mono font-semibold text-gray-900'>
                                                {p.transactionId}
                                            </div>
                                            <div className='text-xs text-gray-400 flex items-center gap-1 mt-0.5'>
                                                <FiCalendar />{' '}
                                                {new Date(
                                                    p.paymentDate,
                                                ).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <div className='font-semibold text-gray-900'>
                                                {p.student?.fullName ||
                                                    'Deleted Student'}
                                            </div>
                                            <div className='text-xs text-gray-500'>
                                                {p.student?.phone}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span className='font-bold text-green-600 text-base'>
                                                ₹
                                                {p.amount.toLocaleString(
                                                    'en-IN',
                                                )}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span className='inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium'>
                                                <FiCreditCard />{' '}
                                                {p.paymentMode?.label || 'N/A'}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 text-gray-600'>
                                            <div className='flex items-center gap-1'>
                                                <FiUser className='text-gray-400' />
                                                {p.collectedBy?.firstName}{' '}
                                                {p.collectedBy?.lastName}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 text-gray-500 text-xs italic max-w-xs truncate'>
                                            {p.remarks || 'No remarks added'}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan='6'
                                            className='px-6 py-12 text-center text-gray-400'
                                        >
                                            No payment transactions recorded
                                            yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <RecordPaymentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onPaymentSuccess={fetchPayments}
                />
            </div>
        </div>
    )
}

export default PaymentManagement
