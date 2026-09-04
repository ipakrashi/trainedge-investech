import mongoose from 'mongoose'

const studentSchema = mongoose.Schema(
    {
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'leadModel',
            required: true,
            unique: true,
            index: true,
        },
        fullName: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        phone: { type: String, required: true, trim: true, unique: true },

        // --- NEW: Operational Address Details ---
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        pincode: { type: String, trim: true },

        // --- NEW: Document Links ---
        studentAgreementLink: { type: String, trim: true },
        certificateLink: { type: String, trim: true },

        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'courseModel',
            },
        ],
        salesCounselor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
        },
        assignedFaculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            index: true,
        },

        totalFee: { type: Number, default: 0, min: 0 },
        paidAmount: { type: Number, default: 0, min: 0 },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PARTIAL', 'PAID'],
            default: 'PENDING',
        },
        installments: [
            {
                amount: { type: Number, required: true },
                paymentDate: { type: Date, default: Date.now },
                paymentMode: {
                    type: String,
                    enum: [
                        'UPI',
                        'BANK_TRANSFER',
                        'CASH',
                        'CREDIT_CARD',
                        'NEFT_RTGS',
                    ],
                    default: 'UPI',
                },
                transactionRef: { type: String, trim: true },
                collectedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'userModel',
                },
            },
        ],

        status: {
            type: String,
            enum: ['PENDING_ASSIGNMENT', 'ACTIVE', 'GRADUATED', 'DROPPED'],
            default: 'PENDING_ASSIGNMENT',
        },
    },
    { timestamps: true },
)

const studentModel = mongoose.model('studentModel', studentSchema, 'students')
export default studentModel
