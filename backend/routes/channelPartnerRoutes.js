import express from 'express'
import partnerController from '../controllers/channelPartnerControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Middleware to authorize Admin or Accounts roles
const adminOrAccounts = (req, res, next) => {
	if (req.user && req.user.role) {
		const roleName = (req.user.role.name || req.user.role)
			.toString()
			.toLowerCase()
		if (['admin', 'accounts'].includes(roleName)) {
			return next()
		}
	}
	res.status(403)
	return res.json({
		success: false,
		message: 'Not authorized as Admin or Accounts',
	})
}

// Apply protect middleware to all partner routes
router.use(protect)

router.route('/payouts').get(partnerController.getAllPayouts)

router
	.route('/')
	.post(partnerController.createPartner)
	.get(partnerController.getPartners)

router
	.route('/:id/balance')
	.get(adminOrAccounts, partnerController.getPartnerAccruedBalance)

router
	.route('/:id/settle')
	.put(adminOrAccounts, partnerController.settlePartnerPayouts)

export default router
