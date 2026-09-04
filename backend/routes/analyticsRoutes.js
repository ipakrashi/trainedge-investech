import express from 'express'
import { getAnalyticsData } from '../controllers/analyticsControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/').get(protect, getAnalyticsData)

export default router
