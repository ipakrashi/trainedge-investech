import mongoose from 'mongoose'
const leadSchema = mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Lead name is required'],
            trim: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            index: true,
        },
        city: {
            type: String,
            trim: true,
        },
        source: {
            type: String,
            enum: [
                'WEBSITE_FORM',
                'GOOGLE_ADS',
                'META_ADS',
                'YOUTUBE',
                'REFERRAL',
                'WALK_IN',
                'WEBINAR',
                'OTHER',
            ],
            default: 'WEBSITE_FORM',
            index: true,
        },
        status: {
            type: String,
            enum: [
                'NEW',
                'CONTACTED',
                'QUALIFIED',
                'DEMO_SCHEDULED',
                'DEMO_ATTENDED',
                'ENROLLED',
                'LOST',
                'JUNK',
            ],
            default: 'NEW',
            index: true,
        },
        interestedCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'courseModel',
            },
        ],
        experienceLevel: {
            type: String,
            enum: ['BEGINNER', 'INTERMEDIATE', 'ACTIVE_TRADER'],
            default: 'BEGINNER',
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            index: true,
        },
        leadScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        lostReason: {
            type: String,
            trim: true,
        },
        nextFollowUpDate: {
            type: Date,
            index: true,
        },
        estimatedValue: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
)

// Compound indexes for high-frequency dashboard queries
leadSchema.index({ status: 1, assignedTo: 1 })
leadSchema.index({ nextFollowUpDate: 1, status: 1 })

const leadModel = mongoose.model('leadModel', leadSchema, 'leads')
export default leadModel
