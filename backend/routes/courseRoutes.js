import express from 'express'
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
} from '../controllers/courseControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Public / Counselor access for reading; Admin-only for creating
router
    .route('/')
    .get(protect, getAllCourses)
    .post(protect, restrictTo('admin'), createCourse)

// Single course operations
router
    .route('/:id')
    .get(protect, getCourseById)
    .put(protect, restrictTo('admin'), updateCourse)
    .delete(protect, restrictTo('admin'), deleteCourse)

export default router
