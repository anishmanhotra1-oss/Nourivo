import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'nourivo_jwt_super_secret_key_2026_fitness_tracker';

  jwt.verify(token, secret, (err, decoded: any) => {
    if (err || !decoded || !decoded.userId) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    req.userId = decoded.userId;
    next();
  });
}
