// src/pages/admin/PaymentManagement.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiPlus, FiCalendar, FiUser, FiCreditCard } from 'react-icons/fi'
import RecordPaymentModal from '../../components/admin/RecordPaymentModal'
import RoleBadge from '../../components/common/RoleBadge'

const PaymentManagement = () => {
    const [payments, setPayments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchPayments = async () => {
        try {
            setIsLoading(true)
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

    const hasPayments = payments && payments.length > 0

    return (
        <div className='bg-gray-50 min-h-screen py-6 sm:py-8'>
            <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header Toolbar */}
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                    <div>
                        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                            Fee Payments & Ledger
                        </h1>
                        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                            Track all student course fee transactions and
                            collection records.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className='flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors w-full sm:w-auto'
                    >
                        <FiPlus className='text-lg' /> Record New Payment
                    </button>
                </div>

                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    {/* 1. MOBILE CARD VIEW (< md screens) */}
                    <div className='block md:hidden divide-y divide-gray-100'>
                        {hasPayments ? (
                            payments.map((p) => (
                                <div
                                    key={p._id}
                                    className='p-4 space-y-3 hover:bg-gray-50 transition-colors'
                                >
                                    {/* Top Row: Tx ID, Student & Amount */}
                                    <div className='flex items-start justify-between gap-2'>
                                        <div>
                                            <span className='font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 inline-block'>
                                                {p.transactionId}
                                            </span>
                                            <div className='font-bold text-gray-900 text-sm mt-1.5'>
                                                {p.student?.fullName ||
                                                    'Deleted Student'}
                                            </div>
                                            {p.student?.phone && (
                                                <div className='text-xs text-gray-500 mt-0.5'>
                                                    {p.student.phone}
                                                </div>
                                            )}
                                        </div>

                                        <div className='text-right flex-shrink-0'>
                                            <span className='font-bold text-green-600 text-base block'>
                                                ₹
                                                {(p.amount || 0).toLocaleString(
                                                    'en-IN',
                                                )}
                                            </span>
                                            <span className='text-[11px] text-gray-400 flex items-center justify-end gap-1 mt-0.5'>
                                                <FiCalendar className='text-xs' />
                                                {new Date(
                                                    p.paymentDate,
                                                ).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Grid: Payment Mode & Collected By */}
                                    <div className='grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs'>
                                        <div>
                                            <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider block'>
                                                Payment Mode
                                            </span>
                                            <span className='inline-flex items-center gap-1 font-medium text-blue-700 mt-0.5'>
                                                <FiCreditCard className='text-xs text-blue-500' />
                                                {p.paymentMode?.label || 'N/A'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider block'>
                                                Collected By
                                            </span>
                                            <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
                                                <span className='font-medium text-gray-800'>
                                                    {p.collectedBy?.firstName}{' '}
                                                    {p.collectedBy?.lastName}
                                                </span>
                                                <RoleBadge
                                                    role={p.collectedBy?.role}
                                                />
                                            </div>
                                        </div>

                                        {p.remarks && (
                                            <div className='col-span-2 pt-1.5 border-t border-gray-200/60 text-gray-600 italic text-[11px]'>
                                                "{p.remarks}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='px-6 py-12 text-center text-sm text-gray-400'>
                                No payment transactions recorded yet.
                            </div>
                        )}
                    </div>

                    {/* 2. DESKTOP TABULAR VIEW (>= md screens) */}
                    <div className='hidden md:block overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-gray-50 text-gray-900 text-xs font-bold uppercase tracking-wider border-b border-gray-100'>
                                    <th className='px-6 py-4'>
                                        Transaction / Date
                                    </th>
                                    <th className='px-6 py-4'>Student</th>
                                    <th className='px-6 py-4'>
                                        Amount Received
                                    </th>
                                    <th className='px-6 py-4'>Payment Mode</th>
                                    <th className='px-6 py-4'>Collected By</th>
                                    <th className='px-6 py-4'>Remarks</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100 text-sm'>
                                {hasPayments ? (
                                    payments.map((p) => (
                                        <tr
                                            key={p._id}
                                            className='hover:bg-gray-50 transition-colors'
                                        >
                                            <td className='px-6 py-4'>
                                                <div className='font-mono font-semibold text-gray-900'>
                                                    {p.transactionId}
                                                </div>
                                                <div className='text-xs text-gray-400 flex items-center gap-1 mt-0.5'>
                                                    <FiCalendar />{' '}
                                                    {new Date(
                                                        p.paymentDate,
                                                    ).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='font-semibold text-gray-900'>
                                                    {p.student?.fullName ||
                                                        'Deleted Student'}
                                                </div>
                                                <div className='text-xs text-gray-500'>
                                                    {p.student?.phone || '-'}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <span className='font-bold text-green-600 text-base'>
                                                    ₹
                                                    {(
                                                        p.amount || 0
                                                    ).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <span className='inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-100'>
                                                    <FiCreditCard />{' '}
                                                    {p.paymentMode?.label ||
                                                        'N/A'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-gray-600'>
                                                <div className='flex items-center gap-2'>
                                                    <FiUser className='text-gray-400' />
                                                    <span className='font-medium text-gray-900'>
                                                        {
                                                            p.collectedBy
                                                                ?.firstName
                                                        }{' '}
                                                        {
                                                            p.collectedBy
                                                                ?.lastName
                                                        }
                                                    </span>
                                                    <RoleBadge
                                                        role={
                                                            p.collectedBy?.role
                                                        }
                                                    />
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-gray-500 text-xs italic max-w-xs truncate'>
                                                {p.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
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
