import express from 'express'
import systemController from '../controllers/systemControllers.js'
import { protect } from '../middlewares/authMiddleware.js'
// Import your admin middleware if you have one, e.g.: import { admin } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Add 'admin' middleware next to 'protect' if you only want super-admins to run this
router.post('/backup', protect, systemController.triggerManualBackup)

export default router
