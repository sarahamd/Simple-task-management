import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

interface JwtPayload {
  id: string;
  email: string;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret: Secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (_err) {
    next(new AppError('Invalid or expired token', 401));
  }
};
