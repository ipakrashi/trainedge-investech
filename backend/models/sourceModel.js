import mongoose from 'mongoose'
const sourceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true, // Forces values like 'google_ads' to 'GOOGLE_ADS'
        },
        label: {
            type: String,
            required: true,
            trim: true, // e.g., 'Google Ads'
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
)
const sourceModel = mongoose.model('sourceModel', sourceSchema, 'sources')
export default sourceModel
