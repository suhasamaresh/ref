import express from 'express';
import * as identityController from '../controllers/identity.controller.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

const router = express.Router();

// Existing routes
router.get('/user/:userId', identityController.getIdentity);
router.get('/me', requireAuth, identityController.getIdentityByReqUser || identityController.getIdentity);

// New ML-powered identity verification routes
router.post('/upload-document', requireAuth, identityController.uploadDocument);
router.get('/documents', requireAuth, identityController.getUserDocuments);
router.get('/trust-score', requireAuth, identityController.getTrustScore);
router.post('/kyc-check', requireAuth, identityController.performKYC);
router.get('/verification-status', requireAuth, identityController.getVerificationStatus);

export default router;
