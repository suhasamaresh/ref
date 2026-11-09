import type { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification.model.ts';

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notes = await Notification.find().limit(50);
        return res.json({ success: true, data: notes });
    } catch (err) {
        return next(err as any);
    }
};

export const listNotificationsForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const notes = await Notification.find({ user: userId }).limit(50);
        return res.json({ success: true, data: notes });
    } catch (err) {
        return next(err as any);
    }
};

export default { listNotifications, listNotificationsForUser };
