import type { Request, Response, NextFunction } from 'express';
import Identity from '../models/Identity.model.ts';
import User from '../models/User.model.ts';
import IdentityDocument from '../models/IdentityDocument.model.ts';
import axios from 'axios';

const AI_MATCHING_SERVICE_URL = process.env.AI_MATCHING_SERVICE_URL || 'http://localhost:8000';

export const getIdentity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        const id = await Identity.findOne({ user: userId }).populate('documents');
        if (!id) return res.status(404).json({ success: false, message: 'Not found' });
        return res.json({ success: true, data: id });
    } catch (err) {
        return next(err as any);
    }
};

export const getIdentityByReqUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const id = await Identity.findOne({ user: userId }).populate('documents');
        if (!id) return res.status(404).json({ success: false, message: 'Not found' });
        return res.json({ success: true, data: id });
    } catch (err) {
        return next(err as any);
    }
};

// Upload and verify document with ML
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as any).user?.id;
		if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

		const { type, number, name, dateOfBirth, expiryDate, issuingCountry } = req.body;

		if (!type) return res.status(400).json({ success: false, message: 'Document type required' });

		// Call Flask AI service to verify document
		const verificationRes = await axios.post<any>(`${AI_MATCHING_SERVICE_URL}/verify-document`, {
			type,
			data: { number, name, date_of_birth: dateOfBirth, expiry_date: expiryDate, issuing_country: issuingCountry }
		}, { timeout: 10000 });

		const verification = verificationRes.data.verification;

		// Save document to database
		const document = await IdentityDocument.create({
			userId,
			type,
			number,
			name,
			dateOfBirth,
			expiryDate,
			issuingCountry,
			verified: verification.verified,
			verificationScore: verification.score,
			verificationConfidence: verification.confidence,
			verificationIssues: verification.issues || [],
			verifiedAt: verification.verified ? new Date() : undefined
		});

		// Update user's activity score
		await User.findByIdAndUpdate(userId, { $inc: { activityScore: 10 } });

		// Recalculate trust score
		await calculateUserTrustScore(userId);

		return res.json({
			success: true,
			data: {
				document,
				verification
			}
		});
	} catch (err) {
		return next(err as any);
	}
};

// Get all documents for user
export const getUserDocuments = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as any).user?.id;
		if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

		const documents = await IdentityDocument.find({ userId }).sort({ createdAt: -1 });
		return res.json({ success: true, data: documents });
	} catch (err) {
		return next(err as any);
	}
};

// Get trust score with ML calculation
export const getTrustScore = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as any).user?.id;
		if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

		const user = await User.findById(userId).lean();
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });

		const documents = await IdentityDocument.find({ userId }).lean();

		// Call Flask AI service to calculate trust score
		const trustRes = await axios.post<any>(`${AI_MATCHING_SERVICE_URL}/calculate-trust-score`, {
			user: {
				...user,
				documents: documents.map(doc => ({
					type: doc.type,
					verified: doc.verified,
					verificationScore: doc.verificationScore
				}))
			}
		}, { timeout: 10000 });

		const trustData = trustRes.data.trust_score;

		// Update user trust score in database
		await User.findByIdAndUpdate(userId, {
			trustScore: trustData.score,
			trustLevel: trustData.level
		});

		return res.json({ success: true, data: trustData });
	} catch (err) {
		return next(err as any);
	}
};

// Perform KYC check
export const performKYC = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as any).user?.id;
		if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

		const user = await User.findById(userId).lean();
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });

		const documents = await IdentityDocument.find({ userId }).lean();

		// Call Flask AI service for KYC check
		const kycRes = await axios.post<any>(`${AI_MATCHING_SERVICE_URL}/kyc-check`, {
			user: {
				name: user.name,
				email: user.email,
				documents: documents.map(doc => ({
					type: doc.type,
					verified: doc.verified
				}))
			}
		}, { timeout: 10000 });

		const kycData = kycRes.data.kyc;

		// Update user KYC status
		await User.findByIdAndUpdate(userId, {
			kycStatus: kycData.level,
			verificationStatus: kycData.verified ? 'verified' : 'pending'
		});

		return res.json({ success: true, data: kycData });
	} catch (err) {
		return next(err as any);
	}
};

// Get verification status
export const getVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as any).user?.id;
		if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

		const user = await User.findById(userId).lean();
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });

		const documents = await IdentityDocument.find({ userId }).lean();

		return res.json({
			success: true,
			data: {
				trustScore: user.trustScore || 0,
				trustLevel: user.trustLevel || 'Low',
				kycStatus: user.kycStatus || 'none',
				verificationStatus: user.verificationStatus || 'unverified',
				documentCount: documents.length,
				verifiedDocuments: documents.filter(doc => doc.verified).length
			}
		});
	} catch (err) {
		return next(err as any);
	}
};

// Helper function to calculate user trust score
async function calculateUserTrustScore(userId: string) {
	try {
		const user = await User.findById(userId).lean();
		const documents = await IdentityDocument.find({ userId }).lean();

		const trustRes = await axios.post<any>(`${AI_MATCHING_SERVICE_URL}/calculate-trust-score`, {
			user: {
				...user,
				documents: documents.map(doc => ({
					type: doc.type,
					verified: doc.verified,
					verificationScore: doc.verificationScore
				}))
			}
		}, { timeout: 10000 });

		const trustData = trustRes.data.trust_score;

		await User.findByIdAndUpdate(userId, {
			trustScore: trustData.score,
			trustLevel: trustData.level
		});
	} catch (err) {
		console.error('Error calculating trust score:', err);
	}
}

export default { 
	getIdentity, 
	getIdentityByReqUser, 
	uploadDocument, 
	getUserDocuments, 
	getTrustScore, 
	performKYC, 
	getVerificationStatus 
};
