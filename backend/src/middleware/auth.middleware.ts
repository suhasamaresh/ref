import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

export const requireAuth = (req: any, res: any, next: any) => {
  const auth = req.headers?.authorization;
  if (!auth) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    (req as any).user = { id: payload.id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default { requireAuth };
