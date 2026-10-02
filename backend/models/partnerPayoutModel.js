import mongoose from 'mongoose'

const partnerPayoutSchema = new mongoose.Schema(
	{
		partner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ChannelPartner', // Updated to match exact registered name
			required: true,
		},
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'studentModel', // Corrected to match your export
			required: true,
			unique: true, // Safety check to prevent duplicate payout ledgers
		},

		// Revenue Data
		totalFeeCollected: {
			type: Number,
			required: true,
		},

		// Commission Math Snapshot (Inclusive Calculation)
		commissionCalculation: {
			totalGrossCommission: { type: Number, required: true },
			baseCommission: { type: Number, required: true },
			gstAmount: { type: Number, default: 0 },
			netPayableToPartner: { type: Number, required: true },
			gstDepositedByCompany: { type: Number, default: 0 },
		},

		status: {
			type: String,
			enum: ['PENDING', 'APPROVED', 'PAID'],
			default: 'PENDING',
		},
		paidOn: {
			type: Date,
		},
		transactionReference: {
			type: String,
		},
	},
	{ timestamps: true },
)

const PartnerPayout = mongoose.model('PartnerPayout', partnerPayoutSchema)
export default PartnerPayout
