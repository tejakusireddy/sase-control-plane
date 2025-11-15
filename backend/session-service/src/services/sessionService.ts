import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface Session {
  id: string;
  orgId: string;
  userId: string;
  gatewayId?: string;
  startedAt: Date;
  endedAt?: Date;
  status: string;
}

interface PolicyHit {
  id: string;
  sessionId: string;
  policyId: string;
  decision: string;
  resource?: string;
  country?: string;
  deviceTrustLevel?: string;
  hitAt: Date;
}

interface AuditLog {
  id: string;
  orgId: string;
  userId?: string;
  action: string;
  resource?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
  details?: any;
  createdAt: Date;
}

class SessionService {
  async recordDecision(data: {
    sessionId?: string;
    orgId: string;
    userId: string;
    gatewayId?: string;
    policyId: string;
    decision: string;
    resource?: string;
    country?: string;
    deviceTrustLevel?: string;
  }): Promise<{ sessionId: string; policyHitId: string }> {
    const pool = db.getPool();

    // Create or get session
    let sessionId = data.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      await pool.execute(
        'INSERT INTO sessions (id, org_id, user_id, gateway_id, status) VALUES (?, ?, ?, ?, ?)',
        [sessionId, data.orgId, data.userId, data.gatewayId || null, 'ACTIVE']
      );
    }

    // Record policy hit
    const policyHitId = uuidv4();
    await pool.execute(
      `INSERT INTO policy_hits 
       (id, session_id, policy_id, decision, resource, country, device_trust_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        policyHitId,
        sessionId,
        data.policyId,
        data.decision,
        data.resource || null,
        data.country || null,
        data.deviceTrustLevel || null,
      ]
    );

    // Create audit log
    const auditLogId = uuidv4();
    await pool.execute(
      `INSERT INTO audit_logs 
       (id, org_id, user_id, action, resource, status, details) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        auditLogId,
        data.orgId,
        data.userId,
        'ACCESS_REQUEST',
        data.resource || null,
        data.decision,
        JSON.stringify({
          policyId: data.policyId,
          gatewayId: data.gatewayId,
          country: data.country,
          deviceTrustLevel: data.deviceTrustLevel,
        }),
      ]
    );

    return { sessionId, policyHitId };
  }

  async endSession(sessionId: string): Promise<void> {
    const pool = db.getPool();
    await pool.execute(
      'UPDATE sessions SET ended_at = NOW(), status = ? WHERE id = ?',
      ['ENDED', sessionId]
    );
  }

  async getSessions(orgId: string, limit: number, offset: number): Promise<Session[]> {
    const pool = db.getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM sessions 
       WHERE org_id = ? 
       ORDER BY started_at DESC 
       LIMIT ? OFFSET ?`,
      [orgId, limit, offset]
    );
    return rows as Session[];
  }

  async getAuditLogs(orgId: string, limit: number, offset: number): Promise<AuditLog[]> {
    const pool = db.getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM audit_logs 
       WHERE org_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [orgId, limit, offset]
    );
    return rows as AuditLog[];
  }
}

export const sessionService = new SessionService();

