import express from 'express'
import multer from 'multer'
import {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead,
    importLeadsCSV,
} from '../controllers/leadController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

// Multer in-memory storage configuration with cross-platform MIME guards
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'text/csv',
            'application/vnd.ms-excel',
            'text/plain',
        ]

        if (
            allowedMimes.includes(file.mimetype) ||
            file.originalname.toLowerCase().endsWith('.csv')
        ) {
            cb(null, true)
        } else {
            cb(new Error('Only .csv files are permitted'), false)
        }
    },
})

const router = express.Router()

// Authenticated Boundary: all endpoints require a valid session
router.use(protect)

// Static / Action routes (placed above /:id to prevent param collision)
router
    .route('/import')
    .post(restrictTo('admin'), upload.single('file'), importLeadsCSV)

// Root collection routes
router.route('/').get(getLeads).post(createLead)

// Dynamic parameter routes
router
    .route('/:id')
    .get(getLeadById)
    .put(updateLead)
    .delete(restrictTo('admin'), deleteLead)

export default router
