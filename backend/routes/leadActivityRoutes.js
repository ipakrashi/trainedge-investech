import express from 'express'
import {
    createActivity,
    getActivitiesByLead,
    updateActivity,
    deleteActivity,
} from '../controllers/leadActivityControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All activity routes require authentication
router.use(protect)

// Routes for creating a new activity
router.route('/').post(createActivity)

// Route for fetching the timeline of a specific lead
router.route('/lead/:leadId').get(getActivitiesByLead)

// Routes for managing individual activities
router.route('/:id').put(updateActivity).delete(deleteActivity)

export default router
