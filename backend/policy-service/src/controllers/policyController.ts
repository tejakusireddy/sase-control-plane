import { Request, Response } from 'express';
import { policyService } from '../services/policyService';
import { ApiError, AccessRequest } from '@sase/shared';

export const policyController = {
  async getPolicies(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const policies = await policyService.getPoliciesByOrgId(orgId);
      res.json(policies);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Get policies error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },

  async createPolicy(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const policy = await policyService.createPolicy(orgId, req.body);
      res.status(201).json(policy);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Create policy error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },

  async evaluate(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const accessRequest: AccessRequest = req.body;

      const result = await policyService.evaluate(orgId, accessRequest);
      res.json(result);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Evaluate error:', error);
      }
      res.status(500).json({
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      } as ApiError);
    }
  },
};

