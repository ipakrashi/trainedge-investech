// server/routes/demoRoutes.js
import express from 'express'
import {
    getActiveDemoMasters,
    createDemoMaster,
    scheduleDemo,
    completeDemo,
    getDemos, // Updated controller import
} from '../controllers/demoControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Catalog Routes
router
    .route('/master')
    .get(protect, getActiveDemoMasters)
    .post(protect, createDemoMaster)

// Scheduling Routes
router.route('/schedule').post(protect, scheduleDemo)

router.route('/schedule/:id/complete').put(protect, completeDemo)

// Calendar/Report Routes
// Changed from /upcoming to /sessions to reflect flexible querying
router.route('/sessions').get(protect, getDemos)

export default router
