import express from 'express';
const router = express.Router();
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, superAdmin, getUsers)
    .post(protect, superAdmin, createUser);

router.route('/:id')
    .put(protect, superAdmin, updateUser)
    .delete(protect, superAdmin, deleteUser);

export default router;