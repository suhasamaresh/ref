import express from 'express';
import * as notificationController from '../controllers/notification.controller.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

// For now notifications are simple and read-only
const router = express.Router();

router.get('/', notificationController.listNotifications || ((req, res) => res.json({ success: true, data: [] })));
router.get('/me', requireAuth, notificationController.listNotificationsForUser || notificationController.listNotifications || ((req, res) => res.json({ success: true, data: [] })));

export default router;
