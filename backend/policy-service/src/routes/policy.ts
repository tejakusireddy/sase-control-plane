import { Router } from 'express';
import { policyController } from '../controllers/policyController';

export const policyRouter = Router();

policyRouter.get('/:orgId/policies', policyController.getPolicies);
policyRouter.post('/:orgId/policies', policyController.createPolicy);
policyRouter.post('/:orgId/evaluate', policyController.evaluate);

