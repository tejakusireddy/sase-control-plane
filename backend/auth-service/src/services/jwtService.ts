import { signToken, verifyToken } from '@sase/shared';
import { JwtPayload } from '@sase/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

class JwtService {
  signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return signToken(payload, JWT_SECRET);
  }

  verifyToken(token: string): JwtPayload {
    return verifyToken(token, JWT_SECRET);
  }
}

export const jwtService = new JwtService();

