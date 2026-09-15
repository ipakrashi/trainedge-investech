import express from 'express'
import evaluationController from '../controllers/evaluationControllers.js'
import { protect, admin } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Authenticate all incoming requests
router.use(protect)

// POST /api/evaluations/bulk (Admin & Faculty only)
router.post('/bulk', evaluationController.recordBulkEvaluations)

// GET /api/evaluations/batch/:batchId (Admin & Faculty assigned to the batch)
router.get('/batch/:batchId', evaluationController.getBatchEvaluations)

// GET /api/evaluations/report/:batchId (Cohort Academic Summary for Admin & Faculty)
router.get('/report/:batchId', evaluationController.getBatchAcademicReport)

// GET /api/evaluations/student/:studentId (Admin, Faculty, or the Student themselves)
router.get('/student/:studentId', evaluationController.getStudentEvaluations)

export default router
