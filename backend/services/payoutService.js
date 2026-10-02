import studentModel from '../models/studentModel.js'
import channelPartnerModel from '../models/channelPartnerModel.js'
import partnerPayoutModel from '../models/partnerPayoutModel.js'

/**
 * Generates a pending payout ledger for a channel partner
 * @param {String} studentId - The ID of the student who completed payments
 * @param {Number} totalFeeCollected - The total revenue collected from this student
 */
export const generatePartnerPayout = async (studentId, totalFeeCollected) => {
	try {
		// 1. Fetch the student and check if they are mapped to a partner
		const student = await studentModel.findById(studentId).populate({
			path: 'channelPartner',
			model: 'ChannelPartner', // Matches the exact registered model name!
		})

		if (!student || !student.channelPartner) {
			return null // Student has no partner, exit silently
		}

		const partner = student.channelPartner

		// 2. Prevent Duplicate Payouts (Safety Check)
		const existingPayout = await partnerPayoutModel.findOne({
			student: studentId,
		})
		if (existingPayout) {
			console.log(
				`[Payout System] Ledger already exists for student: ${studentId}`,
			)
			return existingPayout
		}

		// 3. Calculate Gross Commission Ceiling
		let totalGrossCommission = 0
		if (partner.commissionType === 'FIXED') {
			totalGrossCommission = partner.commissionValue
		} else if (partner.commissionType === 'PERCENTAGE') {
			totalGrossCommission =
				(totalFeeCollected * partner.commissionValue) / 100
		}

		// 4. Apply Reverse GST Math (Inclusive Ceiling)
		let baseCommission = totalGrossCommission
		let gstAmount = 0
		let netPayableToPartner = totalGrossCommission
		let gstDepositedByCompany = 0

		// If the toggle is ON, extract the 18% from the inclusive total
		if (partner.taxProfile?.isGstApplicable) {
			const gstRate = partner.taxProfile.gstRate || 18
			// Reverse math: Total / 1.18
			baseCommission = totalGrossCommission / (1 + gstRate / 100)
			gstAmount = totalGrossCommission - baseCommission

			netPayableToPartner = baseCommission
			gstDepositedByCompany = gstAmount
		}

		// 5. Freeze the math in the Ledger
		const payout = await partnerPayoutModel.create({
			partner: partner._id,
			student: studentId,
			totalFeeCollected: totalFeeCollected,
			commissionCalculation: {
				totalGrossCommission: Number(totalGrossCommission.toFixed(2)),
				baseCommission: Number(baseCommission.toFixed(2)),
				gstAmount: Number(gstAmount.toFixed(2)),
				netPayableToPartner: Number(netPayableToPartner.toFixed(2)),
				gstDepositedByCompany: Number(gstDepositedByCompany.toFixed(2)),
			},
			status: 'PENDING',
		})

		console.log(
			`[Payout System] Generated PENDING payout of ₹${netPayableToPartner.toFixed(2)} for ${partner.partnerName}`,
		)
		return payout
	} catch (error) {
		console.error('[Payout System Error]:', error)
		throw new Error('Failed to generate partner payout')
	}
}
