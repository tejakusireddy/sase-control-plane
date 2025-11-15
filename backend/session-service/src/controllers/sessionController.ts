import { Request, Response } from 'express';
import { sessionService } from '../services/sessionService';
import { ApiError } from '@sase/shared';

export const sessionController = {
  async recordDecision(req: Request, res: Response) {
    try {
      const decision = await sessionService.recordDecision(req.body);
      res.status(201).json(decision);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Record decision error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },

  async endSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      await sessionService.endSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('End session error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },

  async getSessions(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const { limit = '50', offset = '0' } = req.query;
      const sessions = await sessionService.getSessions(
        orgId,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(sessions);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Get sessions error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },

  async getAuditLogs(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const { limit = '50', offset = '0' } = req.query;
      const logs = await sessionService.getAuditLogs(
        orgId,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(logs);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Get audit logs error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },
};

