import express from 'express'
import {
    recordPayment,
    getPayments,
} from '../controllers/paymentControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/').get(getPayments).post(recordPayment) // Role validation handled internally in controller for Admin/Accounts flexibility

export default router
