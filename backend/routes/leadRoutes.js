import express from 'express'
import {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead,
} from '../controllers/leadController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/').get(getLeads).post(createLead)
router
    .route('/:id')
    .get(getLeadById)
    .put(updateLead)
    .delete(restrictTo('admin'), deleteLead)

export default router
