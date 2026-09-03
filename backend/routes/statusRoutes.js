import express from 'express'
import { getStatuses, createStatus } from '../controllers/statusControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()
router.use(protect)
router.route('/').get(getStatuses).post(restrictTo('admin'), createStatus)
export default router
