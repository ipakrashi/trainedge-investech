import express from 'express'
import sessionLogController from '../controllers/sessionLogControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Apply protect middleware to all routes
router.use(protect)

// POST /api/sessions
router.post('/', sessionLogController.createSessionLog)

// GET /api/sessions/batch/:batchId
router.get('/batch/:batchId', sessionLogController.getBatchSessions)

export default router
