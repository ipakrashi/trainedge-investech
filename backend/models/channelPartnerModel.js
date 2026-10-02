import mongoose from 'mongoose'

const channelPartnerSchema = new mongoose.Schema(
    {
        partnerName: { 
            type: String, 
            required: true 
        },
        uniqueCode: { 
            type: String, 
            required: true, 
            unique: true,
            uppercase: true, // e.g., 'TE-KOL-01'
        },
        
        // Commission Structure
        commissionType: { 
            type: String, 
            enum: ['PERCENTAGE', 'FIXED'], 
            required: true 
        },
        commissionValue: { 
            type: Number, 
            required: true 
        }, // 10 (for 10%) or 5000 (for ₹5000)
        
        // Tax & Compliance (Future-Proofed for Inclusive GST)
        taxProfile: {
            panNumber: { type: String, uppercase: true },
            gstNumber: { type: String, uppercase: true },
            isGstApplicable: { type: Boolean, default: false }, // The master toggle
            gstRate: { type: Number, default: 18 }
        },

        contactDetails: {
            email: { type: String, required: true },
            phone: { type: String, required: true }
        },
        bankDetails: {
            accountName: String,
            accountNumber: String,
            ifscCode: { type: String, uppercase: true }
        },
        isActive: { 
            type: Boolean, 
            default: true 
        }
    }, 
    { timestamps: true }
)

const ChannelPartner = mongoose.model('ChannelPartner', channelPartnerSchema)
export default ChannelPartner