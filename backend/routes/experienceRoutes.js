import express from 'express'
import {
    getExperiences,
    createExperience,
} from '../controllers/experienceControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()
router.use(protect)
router
    .route('/')
    .get(getExperiences)
    .post(restrictTo('admin'), createExperience)
export default router
