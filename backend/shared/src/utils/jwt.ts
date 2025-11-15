import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string): string {
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '24h' });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

