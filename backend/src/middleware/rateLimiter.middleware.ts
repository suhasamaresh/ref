import type { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter for demonstration. Not suitable for production.
const requests: Record<string, { count: number; firstRequestAt: number }> = {};

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
	const key = typeof req.ip === 'string'
		? req.ip
		: Array.isArray(req.headers['x-forwarded-for'])
			? String(req.headers['x-forwarded-for'][0])
			: typeof req.headers['x-forwarded-for'] === 'string'
				? req.headers['x-forwarded-for']
				: 'global';
	const now = Date.now();
	const windowMs = 60 * 1000; // 1 minute
	const max = 60; // max requests per window

	if (!requests[key]) {
		requests[key] = { count: 1, firstRequestAt: now };
		return next();
	}

	const entry = requests[key];
	if (now - entry.firstRequestAt > windowMs) {
		// reset
		requests[key] = { count: 1, firstRequestAt: now };
		return next();
	}

	if (entry.count >= max) {
		return res.status(429).json({ success: false, message: 'Too many requests' });
	}

	entry.count += 1;
	next();
};

// Export named and default so consumers can import { rateLimiter } or default
export { rateLimiter };
export default rateLimiter;