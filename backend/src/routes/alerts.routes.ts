import express from 'express';
import * as AlertsController from '../controllers/alerts.controller.ts';

const router = express.Router();

router.get('/', AlertsController.getAlerts);

export default router;
