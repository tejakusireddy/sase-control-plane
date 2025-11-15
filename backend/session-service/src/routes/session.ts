import { Router } from 'express';
import { sessionController } from '../controllers/sessionController';

export const sessionRouter = Router();

sessionRouter.post('/sessions/record-decision', sessionController.recordDecision);
sessionRouter.post('/sessions/end', sessionController.endSession);
sessionRouter.get('/orgs/:orgId/sessions', sessionController.getSessions);
sessionRouter.get('/orgs/:orgId/audit-logs', sessionController.getAuditLogs);

