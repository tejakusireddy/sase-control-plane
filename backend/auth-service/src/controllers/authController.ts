import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { jwtService } from '../services/jwtService';
import { ApiError } from '@sase/shared';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: { message: 'Email and password are required', code: 'MISSING_CREDENTIALS' },
        } as ApiError);
      }

      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        } as ApiError);
      }

      const isValid = await userService.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        } as ApiError);
      }

      const token = jwtService.signToken({
        sub: user.id,
        orgId: user.orgId,
        role: user.role as any,
        email: user.email,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
        },
      });
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Login error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: { message: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
        } as ApiError);
      }

      const token = authHeader.substring(7);
      const payload = jwtService.verifyToken(token);

      const user = await userService.findById(payload.sub);
      if (!user) {
        return res.status(404).json({
          error: { message: 'User not found', code: 'USER_NOT_FOUND' },
        } as ApiError);
      }

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        } as ApiError);
      }
      if (process.env.NODE_ENV !== 'production') {
        console.error('Get me error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },
};

