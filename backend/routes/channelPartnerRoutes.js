import express from 'express'
import partnerController from '../controllers/channelPartnerControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Apply protect middleware to all partner routes
router.use(protect)
router.route('/payouts').get(partnerController.getAllPayouts)
router
	.route('/')
	.post(partnerController.createPartner)
	.get(partnerController.getPartners)

router
	.route('/:id/balance')
	.get(protect, adminOrAccounts, getPartnerAccruedBalance)
router.route('/:id/settle').put(protect, adminOrAccounts, settlePartnerPayouts)
export default router
