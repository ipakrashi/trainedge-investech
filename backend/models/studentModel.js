import mongoose from 'mongoose'

const studentSchema = mongoose.Schema(
    {
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'leadModel',
            required: true,
            unique: true, // Guarantees 1:1 relationship
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

        // Delivery details (Populated by Admin during mapping)
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'courseModel',
            },
        ],
        // Sales person who closed it (historical)
        salesCounselor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
        },
        // The educator who delivers it (Access Control)
        assignedFaculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            index: true,
        },

        // Financials (Defaulted to 0 until Admin maps it)
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
            // PENDING_ASSIGNMENT allows the auto-creation to hold until Admin maps it
            enum: ['PENDING_ASSIGNMENT', 'ACTIVE', 'GRADUATED', 'DROPPED'],
            default: 'PENDING_ASSIGNMENT',
        },
    },
    { timestamps: true },
)

const studentModel = mongoose.model('studentModel', studentSchema, 'students')
export default studentModel
