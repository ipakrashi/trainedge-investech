import express from 'express'
import {
    addUser,
    getUsers,
    loginUser,
    logoutUser,
    editUser,
    deleteUser,
    getRoles,
} from '../controllers/userControllers.js'

import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// --- Public Routes ---
router.post('/login', loginUser)
router.post('/logout', logoutUser)

// --- Authenticated Boundary ---
// Every route defined below this line automatically runs the protect middleware
router.use(protect)

// --- Admin-Only Collection Routes ---
router
    .route('/')
    .get(restrictTo('admin'), getUsers)
    .post(restrictTo('admin'), addUser)

// Static sub-resource: must precede parameterized (/:id) routes
router.get('/roles', restrictTo('admin'), getRoles)

// --- Parameterized Routes (Always at the bottom) ---
router.route('/:id').put(editUser).delete(restrictTo('admin'), deleteUser)

export default router
