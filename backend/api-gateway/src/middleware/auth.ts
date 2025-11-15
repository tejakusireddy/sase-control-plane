import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@sase/shared';
import { ApiError, JwtPayload } from '@sase/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { message: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
      } as ApiError);
    }

    const token = authHeader.substring(7);
    const payload: JwtPayload = verifyToken(token, JWT_SECRET);

    (req as any).user = payload;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
      } as ApiError);
    }
    return res.status(500).json({
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    } as ApiError);
  }
}