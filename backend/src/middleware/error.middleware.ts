import type { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  res.status(status).json({ success: false, message, error: process.env.NODE_ENV === 'development' ? err : undefined });
};

export default errorHandler;
