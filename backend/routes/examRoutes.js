import express from 'express'
import {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
} from '../controllers/examControllers.js'
import { protect, admin } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/').get(getExams).post(admin, createExam)

router
    .route('/:id')
    .get(getExamById)
    .put(admin, updateExam)
    .delete(admin, deleteExam)

export default router
