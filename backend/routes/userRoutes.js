import express from 'express'
import {
    addUser,
    getUsers,
    loginUser,
    logoutUser,
    editUser,
    deleteUser,
    getRoles, // Included successfully
} from '../controllers/userControllers.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/login', loginUser)
router.post('/logout', logoutUser)

router.post('/addNew', addUser)
router.get('/roles', protect, restrictTo('admin'), getRoles)

router
    .route('/:id')
    .put(protect, editUser)
    .delete(protect, restrictTo('admin'), deleteUser)

router.get('/getUsers', protect, restrictTo('admin'), getUsers)

export default router
