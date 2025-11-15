import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@sase/shared';

const apiKeyCache = new Map<string, { orgId: string; gatewayId: string }>();

export async function gatewayAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({
        error: { message: 'Missing API key', code: 'MISSING_API_KEY' },
      } as ApiError);
    }

    if (apiKeyCache.has(apiKey)) {
      (req as any).gateway = apiKeyCache.get(apiKey);
      return next();
    }

    if (apiKey === 'acme-gw-key-123') {
      const gateway = {
        orgId: 'acme',
        gatewayId: 'acme-sfo-1',
      };
      apiKeyCache.set(apiKey, gateway);
      (req as any).gateway = gateway;
      return next();
    }

    return res.status(401).json({
      error: { message: 'Invalid API key', code: 'INVALID_API_KEY' },
    } as ApiError);
  } catch (error) {
    return res.status(500).json({
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    } as ApiError);
  }
}

