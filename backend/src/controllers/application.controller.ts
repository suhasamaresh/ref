import type { Request, Response, NextFunction } from 'express';
import Application from '../models/Application.model.ts';

export const listApplications = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const apps = await Application.find().limit(50);
		return res.json({ success: true, data: apps });
	} catch (err) {
		return next(err as any);
	}
};

export const getApplication = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const app = await Application.findById(req.params.id);
		if (!app) return res.status(404).json({ success: false, message: 'Not found' });
		return res.json({ success: true, data: app });
	} catch (err) {
		return next(err as any);
	}
};

export default { listApplications, getApplication };
