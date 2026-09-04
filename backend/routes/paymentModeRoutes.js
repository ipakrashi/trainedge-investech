import express from 'express'
import {
    getPaymentModes,
    createPaymentMode,
} from '../controllers/paymentModeControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router
    .route('/')
    .get(getPaymentModes)
    .post(restrictTo('admin'), createPaymentMode)

export default router
