import User from '../models/User.model.ts';
import Resource from '../models/Resource.model.ts';
import axios from 'axios';
import type { Request, Response, NextFunction } from 'express';

const AI_MATCHING_SERVICE_URL = process.env.AI_MATCHING_SERVICE_URL || 'http://localhost:8000';

// Get resource categories — tries AI service first, falls back to MongoDB distinct types
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
	try {
		try {
			const flaskRes = await axios.get<any>(`${AI_MATCHING_SERVICE_URL}/categories`, { timeout: 3000 });
			const flaskData = flaskRes.data as { success?: boolean; categories?: any[] };
			if (flaskData && flaskData.success) {
				return res.json({ success: true, data: flaskData.categories });
			}
		} catch (_aiErr) {
			// AI service not available — fall through to MongoDB fallback
		}

		// Fallback: derive categories from MongoDB resource types
		const types = await Resource.distinct('type');
		const categories = types
			.filter(Boolean)
			.map((t: string) => ({ id: t, name: t.charAt(0).toUpperCase() + t.slice(1) }));
		return res.json({ success: true, data: categories });
	} catch (err) {
		return next(err as any);
	}
};

// Search resources — tries AI service first, falls back to MongoDB text/tag search
export const searchResources = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { category, location, query, needs } = req.body;

		try {
			const flaskRes = await axios.post<any>(`${AI_MATCHING_SERVICE_URL}/search`, {
				category: category || 'general',
				location: location || '',
				query: query || '',
				needs: needs || []
			}, { timeout: 5000 });

			const flaskData = flaskRes.data as { success?: boolean; results?: any[]; message?: string };
			if (flaskData && flaskData.success) {
				return res.json({ success: true, data: flaskData.results });
			}
		} catch (_aiErr) {
			// AI service not available — fall through to MongoDB fallback
		}

		// Fallback: query MongoDB directly using category/query/needs filters
		const filter: Record<string, any> = {};

		if (category && category !== 'general') {
			filter.type = { $regex: category, $options: 'i' };
		}

		const keywordSources: string[] = [];
		if (query) keywordSources.push(query);
		if (Array.isArray(needs)) keywordSources.push(...needs);

		if (keywordSources.length > 0) {
			const patterns = keywordSources.map(k => new RegExp(k, 'i'));
			filter.$or = [
				{ title: { $in: patterns } },
				{ description: { $in: patterns } },
				{ tags: { $in: patterns } },
				{ eligibility: { $in: patterns } },
			];
		}

		const results = await Resource.find(filter).limit(20).lean();
		return res.json({ success: true, data: results });
	} catch (err) {
		return next(err as any);
	}
};

// AI-powered matching: call Flask service (legacy for database resources)
export const matchResources = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = (req as any).user?.id || req.query.userId;
		if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
		const user = await User.findById(userId).lean();
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });

		// Get all resources (or filter as needed)
		const resources = await Resource.find().lean();

		try {
			// Call Flask AI matching service
			const flaskRes = await axios.post<any>(`${AI_MATCHING_SERVICE_URL}/match`, {
				user,
				resources
			}, { timeout: 10000 });
			const flaskData = flaskRes.data as { success?: boolean; matches?: any[]; message?: string };
			if (flaskData && flaskData.success) {
				return res.json({ success: true, data: flaskData.matches });
			}
		} catch (_aiErr) {
			// AI service not available — return all resources as fallback matches
		}

		return res.json({ success: true, data: resources });
	} catch (err) {
		return next(err as any);
	}
};

export const listResources = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const resources = await Resource.find().limit(50);
		return res.json({ success: true, data: resources });
	} catch (err) {
		return next(err as any);
	}
};

export const getResource = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const resource = await Resource.findById(req.params.id);
		if (!resource) return res.status(404).json({ success: false, message: 'Not found' });
		return res.json({ success: true, data: resource });
	} catch (err) {
		return next(err as any);
	}
};

export default { listResources, getResource };
