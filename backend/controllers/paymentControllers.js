import asyncHandler from 'express-async-handler'
import paymentModel from '../models/paymentModel.js'
import studentModel from '../models/studentModel.js'
import userModel from '../models/userModel.js' // <-- Add this import

// Helper to check role authorization for payments (Admin or Accounts)
const checkAdminOrAccounts = (user) => {
    if (!user || !user.role) return false
    const roleName = (user.role.name || user.role).toString().toLowerCase()
    return ['admin', 'accounts'].includes(roleName)
}

// @desc    Record a new fee payment for a student
// @route   POST /api/payments
// @access  Private (Admin / Accounts)
export const recordPayment = asyncHandler(async (req, res) => {
    if (!checkAdminOrAccounts(req.user)) {
        res.status(403)
        throw new Error(
            'Not authorized. Only Admin or Accounts roles can collect payments.',
        )
    }

    const {
        studentId,
        amount,
        paymentDate,
        transactionId,
        paymentMode,
        remarks,
    } = req.body

    if (!studentId || !amount || !transactionId || !paymentMode) {
        res.status(400)
        throw new Error(
            'Student, amount, transaction ID, and payment mode are required.',
        )
    }

    const student = await studentModel.findById(studentId)
    if (!student) {
        res.status(404)
        throw new Error('Student record not found.')
    }

    // Create the payment entry
    const payment = await paymentModel.create({
        student: studentId,
        amount,
        paymentDate: paymentDate || Date.now(),
        transactionId,
        paymentMode,
        collectedBy: req.user._id,
        remarks,
    })

    // Update student's cumulative paid amount and status
    student.paidAmount = (student.paidAmount || 0) + Number(amount)
    if (student.paidAmount >= student.totalFee) {
        student.paymentStatus = 'PAID'
    } else {
        student.paymentStatus = 'PARTIAL'
    }
    await student.save()

    const populatedPayment = await paymentModel
        .findById(payment._id)
        .populate('paymentMode', 'label name')
        .populate('collectedBy', 'firstName lastName email')
        .populate('student', 'fullName email phone')

    res.status(201).json({
        success: true,
        data: populatedPayment,
        message: 'Payment recorded and student ledger updated successfully.',
    })
})

// @desc    Get payment history (Global or Student-wise)
// @route   GET /api/payments
// @access  Private (Admin / Accounts / Faculty scoped)
export const getPayments = asyncHandler(async (req, res) => {
    const { studentId } = req.query
    const query = {}

    if (studentId) {
        query.student = studentId
    }

    const roleName = (req.user.role?.name || req.user.role || '').toLowerCase()

    // Faculty can only view payments of students assigned to them
    if (roleName === 'faculty') {
        const assignedStudents = await studentModel
            .find({ assignedFaculty: req.user._id })
            .select('_id')
        const studentIds = assignedStudents.map((s) => s._id)
        query.student = { $in: studentIds }
    }

    const payments = await paymentModel
        .find(query)
        .populate(
            'student',
            'fullName email phone totalFee paidAmount paymentStatus',
        )
        .populate('paymentMode', 'label name')
        .populate('collectedBy', 'firstName lastName email')
        .sort({ paymentDate: -1, createdAt: -1 })

    res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
    })
})
