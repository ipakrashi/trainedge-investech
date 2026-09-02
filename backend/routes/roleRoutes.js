import express from 'express'
import { getRoles, createRole } from '../controllers/roleControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .get(protect, restrictTo('admin'), getRoles)
    .post(protect, restrictTo('admin'), createRole)

export default router
