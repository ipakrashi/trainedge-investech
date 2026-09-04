import express from 'express'
import {
    getStudents,
    mapStudentFaculty,
    updateStudentDetails,
} from '../controllers/studentControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Accessible by Admin, Accounts, and Faculty
router.route('/').get(protect, getStudents)

// Admin updates to address, links, and operational status
router.route('/:id').put(protect, restrictTo('admin'), updateStudentDetails)

// Admin executes initial faculty mapping
router
    .route('/:id/map-faculty')
    .put(protect, restrictTo('admin'), mapStudentFaculty)

export default router
