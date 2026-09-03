import express from 'express'
import { getSources, createSource } from '../controllers/sourceControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Apply protect middleware to all routes
router.use(protect)

router.route('/').get(getSources).post(restrictTo('admin'), createSource)

export default router
