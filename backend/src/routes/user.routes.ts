import express from 'express';
import * as userController from '../controllers/user.controller.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

const router = express.Router();

router.get('/:id', userController.getProfile);
router.put('/:id', userController.updateProfile);
// current user endpoints
router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, userController.updateMe);

export default router;
