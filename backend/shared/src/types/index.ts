// Common types used across services

export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'SEC_ANALYST' | 'ENGINEER' | 'VIEWER';

export type DeviceTrustLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNTRUSTED';

export type PolicyEffect = 'ALLOW' | 'DENY';

export interface JwtPayload {
  sub: string; // user ID
  orgId: string;
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ApiError {
  error: {
    message: string;
    code?: string;
  };
}

export interface AccessRequest {
  userId: string;
  userRole: UserRole;
  deviceTrustLevel: DeviceTrustLevel;
  country: string;
  resource: string;
  action?: string;
}

export interface PolicyCondition {
  roles?: UserRole[];
  deviceTrustLevels?: DeviceTrustLevel[];
  countries?: string[];
  resources?: string[];
  timeWindow?: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone?: string;
  };
}

export interface Policy {
  _id?: string;
  orgId: string;
  name: string;
  priority: number;
  conditions: PolicyCondition;
  effect: PolicyEffect;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PolicyEvaluationResult {
  decision: PolicyEffect;
  matchedPolicyIds: string[];
  reason?: string;
}


