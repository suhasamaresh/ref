import User from '../models/User.model.ts';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change_me_refresh';
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN || '7d';

function signAccessToken(userId: string) {
	return (jwt as any).sign({ id: userId }, JWT_SECRET as any, { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(userId: string) {
	return (jwt as any).sign({ id: userId }, JWT_REFRESH_SECRET as any, { expiresIn: REFRESH_EXPIRES });
}

const sanitizeUser = (user: any) => {
	const u = user.toObject ? user.toObject() : user;
	delete u.password;
	return u;
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email, password } = req.body;
		if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });
		const hashed = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, password: hashed });
		const userId = (user as any)._id?.toString?.() || String((user as any)._id);
		const accessToken = signAccessToken(userId);
		const refreshToken = signRefreshToken(userId);
		return res.status(201).json({ success: true, data: { user: sanitizeUser(user), accessToken, refreshToken } });
	} catch (err) {
		return next(err as any);
	}
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
		const user = await User.findOne({ email }).select('+password');
		if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
		const match = await bcrypt.compare(password, (user as any).password || '');
		if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
		const userId = (user as any)._id?.toString?.() || String((user as any)._id);
		const accessToken = signAccessToken(userId);
		const refreshToken = signRefreshToken(userId);
		return res.json({ success: true, data: { user: sanitizeUser(user), accessToken, refreshToken } });
	} catch (err) {
		return next(err as any);
	}
};

export const logout = async (req: Request, res: Response) => {
	// Without refresh token storage, instruct client to drop tokens
	return res.json({ success: true, message: 'Logged out' });
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.body.refreshToken || req.headers['x-refresh-token'] || req.cookies?.refreshToken;
		if (!token) return res.status(400).json({ success: false, message: 'Refresh token required' });
		const payload: any = jwt.verify(token, JWT_REFRESH_SECRET);
		const user = await User.findById(payload.id);
		if (!user) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
		const userId = (user as any)._id?.toString?.() || String((user as any)._id);
		const accessToken = signAccessToken(userId);
		return res.json({ success: true, data: { accessToken } });
	} catch (err) {
		return next(err as any);
	}
};

export default { register, login, logout, refreshToken };
