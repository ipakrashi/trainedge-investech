import express from 'express'
import {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead,
    importLeadsCSV,
} from '../controllers/leadController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

router.use(protect)

router.route('/import').post(protect, upload.single('file'), importLeadsCSV)
router.route('/').get(getLeads).post(createLead)
router
    .route('/:id')
    .get(getLeadById)
    .put(updateLead)
    .delete(restrictTo('admin'), deleteLead)

export default router
