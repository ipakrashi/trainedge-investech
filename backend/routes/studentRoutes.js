import express from 'express'
import {
    getStudents,
    mapStudentFaculty,
} from '../controllers/studentControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Accessible by Admin and Faculty (Controller handles the internal query scoping)
router.route('/').get(protect, getStudents)

// Only Admins can execute the mapping functionality
router
    .route('/:id/map-faculty')
    .put(protect, restrictTo('admin'), mapStudentFaculty)

export default router
