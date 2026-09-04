// src/components/admin/RecordPaymentModal.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { FiX, FiDollarSign } from 'react-icons/fi'

const RecordPaymentModal = ({ isOpen, onClose, onPaymentSuccess }) => {
    const [students, setStudents] = useState([])
    const [paymentModes, setPaymentModes] = useState([])
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: '',
        paymentMode: '',
        remarks: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchDropdownData()
        }
    }, [isOpen])

    const fetchDropdownData = async () => {
        try {
            const [studentsRes, modesRes] = await Promise.all([
                api.get('/students'),
                api.get('/payment-modes'),
            ])

            const validStudents = (
                studentsRes.data?.data ||
                studentsRes.data ||
                []
            ).filter((s) => s.status !== 'PENDING_ASSIGNMENT')
            setStudents(validStudents)

            // Flexible fallback parsing for payment modes array
            const modesData = modesRes.data?.data || modesRes.data || []
            setPaymentModes(Array.isArray(modesData) ? modesData : [])
        } catch (err) {
            console.error('Failed to load payment form dependencies:', err)
            setError('Failed to load students or payment modes.')
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            await api.post('/payments', formData)
            onPaymentSuccess()
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record payment.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
            <div className='bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100'>
                <div className='flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50'>
                    <h3 className='font-bold text-gray-900 flex items-center gap-2'>
                        <FiDollarSign className='text-green-600' /> Record Fee
                        Payment
                    </h3>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 p-1 rounded-lg'
                    >
                        <FiX className='text-xl' />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                    {error && (
                        <div className='p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg'>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                            Select Student
                        </label>
                        <select
                            name='studentId'
                            value={formData.studentId}
                            onChange={handleChange}
                            required
                            className='w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500'
                        >
                            <option value=''>-- Choose Student --</option>
                            {students.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.fullName} ({s.email}) - Due: ₹
                                    {(s.totalFee - s.paidAmount).toLocaleString(
                                        'en-IN',
                                    )}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                Amount (₹)
                            </label>
                            <input
                                type='number'
                                name='amount'
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder='e.g. 15000'
                                required
                                min='1'
                                className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                Payment Date
                            </label>
                            <input
                                type='date'
                                name='paymentDate'
                                value={formData.paymentDate}
                                onChange={handleChange}
                                required
                                className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                Transaction ID / Ref No
                            </label>
                            <input
                                type='text'
                                name='transactionId'
                                value={formData.transactionId}
                                onChange={handleChange}
                                placeholder='e.g. TXN987654321'
                                required
                                className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                                Payment Mode
                            </label>
                            <select
                                name='paymentMode'
                                value={formData.paymentMode}
                                onChange={handleChange}
                                required
                                className='w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500'
                            >
                                <option value=''>-- Select Mode --</option>
                                {paymentModes.map((m) => (
                                    <option key={m._id} value={m._id}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
                            Remarks / Notes (Optional)
                        </label>
                        <textarea
                            name='remarks'
                            value={formData.remarks}
                            onChange={handleChange}
                            rows='2'
                            placeholder='Add any additional transaction notes...'
                            className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500'
                        ></textarea>
                    </div>

                    <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm disabled:opacity-50'
                        >
                            {isLoading ? 'Recording...' : 'Save Payment Mode'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RecordPaymentModal
