import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'
import ChannelPartner from '../models/channelPartnerModel.js'
import PartnerPayout from '../models/partnerPayoutModel.js'

// @desc    Create a new channel partner (Franchisee)
// @route   POST /api/partners
// @access  Private
const createPartner = asyncHandler(async (req, res) => {
	const {
		partnerName,
		uniqueCode,
		commissionType,
		commissionValue,
		taxProfile,
		contactDetails,
		bankDetails,
	} = req.body

	const partnerExists = await ChannelPartner.findOne({
		uniqueCode: uniqueCode.toUpperCase(),
	})

	if (partnerExists) {
		res.status(400)
		throw new Error(`A partner with code ${uniqueCode} already exists.`)
	}

	const partner = await ChannelPartner.create({
		partnerName,
		uniqueCode: uniqueCode.toUpperCase(),
		commissionType,
		commissionValue,
		taxProfile,
		contactDetails,
		bankDetails,
	})

	res.status(201).json({
		success: true,
		data: partner,
	})
})

// @desc    Get all active channel partners
// @route   GET /api/partners
// @access  Private
const getPartners = asyncHandler(async (req, res) => {
	// You might only want active partners for the frontend dropdowns
	const partners = await ChannelPartner.find({ isActive: true }).sort({
		createdAt: -1,
	})

	res.status(200).json({
		success: true,
		count: partners.length,
		data: partners,
	})
})

// @desc    Get all payouts (with partner and student details)
// @route   GET /api/partners/payouts
// @access  Private (Admin/Accounts)
const getAllPayouts = asyncHandler(async (req, res) => {
	const payouts = await PartnerPayout.find({})
		.populate(
			'partner',
			'partnerName uniqueCode taxProfile.isGstApplicable bankDetails',
		)
		.populate('student', 'fullName email phone')
		.sort({ createdAt: -1 })

	res.status(200).json({
		success: true,
		count: payouts.length,
		data: payouts,
	})
})
// @desc    Get accrued balance and pending payout stats for a specific partner
// @route   GET /api/partners/:id/balance
// @access  Private (Admin / Accounts)
const getPartnerAccruedBalance = asyncHandler(async (req, res) => {
	const { id } = req.params

	const partner = await ChannelPartner.findById(id)
	if (!partner) {
		res.status(404)
		throw new Error('Channel partner not found.')
	}

	const result = await PartnerPayout.aggregate([
		{
			$match: {
				partner: new mongoose.Types.ObjectId(id),
				status: 'PENDING', // Only sum unpaid/pending commissions
			},
		},
		{
			$group: {
				_id: '$partner',
				totalAccruedPayable: {
					$sum: '$commissionCalculation.netPayableToPartner',
				},
				totalGstHeld: {
					$sum: '$commissionCalculation.gstDepositedByCompany',
				},
				pendingPayoutCount: { $sum: 1 },
			},
		},
	])

	const balanceData = result[0] || {
		totalAccruedPayable: 0,
		totalGstHeld: 0,
		pendingPayoutCount: 0,
	}

	res.status(200).json({
		success: true,
		data: {
			partnerId: partner._id,
			partnerName: partner.partnerName,
			uniqueCode: partner.uniqueCode,
			...balanceData,
		},
	})
})

// @desc    Bulk settle all pending payouts for a partner
// @route   PUT /api/partners/:id/settle
// @access  Private (Admin / Accounts)
const settlePartnerPayouts = asyncHandler(async (req, res) => {
	const { id } = req.params
	const { transactionReference } = req.body

	if (!transactionReference) {
		res.status(400)
		throw new Error(
			'Transaction reference (UTR / Payout ID) is required for settlement.',
		)
	}

	const partner = await ChannelPartner.findById(id)
	if (!partner) {
		res.status(404)
		throw new Error('Channel partner not found.')
	}

	const updateResult = await PartnerPayout.updateMany(
		{ partner: id, status: 'PENDING' },
		{
			$set: {
				status: 'PAID',
				paidOn: Date.now(),
				transactionReference: transactionReference.trim(),
			},
		},
	)

	if (updateResult.modifiedCount === 0) {
		res.status(400)
		throw new Error('No pending payouts found to settle for this partner.')
	}

	res.status(200).json({
		success: true,
		message: `Successfully settled ${updateResult.modifiedCount} payout(s) for ${partner.partnerName}.`,
		transactionReference: transactionReference.trim(),
	})
})
export default {
	createPartner,
	getPartners,
	getAllPayouts, // <-- Now properly exported for your route!
	getPartnerAccruedBalance, // <-- Added here
	settlePartnerPayouts,
}
