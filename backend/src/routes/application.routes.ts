import express from 'express';
import * as applicationController from '../controllers/application.controller.ts';

const router = express.Router();

router.get('/', applicationController.listApplications);
router.get('/:id', applicationController.getApplication);

export default router;
