import express from 'express'
import batchController from '../controllers/batchControllers.js'
import { protect, admin } from '../middlewares/authMiddleware.js' // Assuming standard names for your middleware

const router = express.Router()

// Apply protect middleware to all routes in this file
router.use(protect)

// GET /api/batches (Admin & Faculty)
// POST /api/batches (Admin Only)
router
    .route('/')
    .get(batchController.getBatches)
    .post(admin, batchController.createBatch)

// GET /api/batches/:id (Admin & Faculty)
router.route('/:id').get(batchController.getBatchById)

// PUT /api/batches/:id/students (Admin Only - Assigning students to a cohort)
router.route('/:id/students').put(admin, batchController.addStudentsToBatch)

export default router
