import express from 'express'
import evaluationController from '../controllers/evaluationControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

// POST /api/evaluations/bulk
router.post('/bulk', evaluationController.recordBulkEvaluations)

// GET /api/evaluations/batch/:batchId
router.get('/batch/:batchId', evaluationController.getBatchEvaluations)

// GET /api/evaluations/student/:studentId
router.get('/student/:studentId', evaluationController.getStudentEvaluations)

router.get('/report/:batchId', evaluationController.getBatchAcademicReport)

export default router
