import { db } from '../db';
import { Policy, PolicyEvaluationResult, AccessRequest, PolicyCondition } from '@sase/shared';
import { ObjectId } from 'mongodb';

class PolicyService {
  async getPoliciesByOrgId(orgId: string): Promise<Policy[]> {
    const cacheKey = `policies:${orgId}`;
    const redis = db.getRedis();
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from MongoDB
    const collection = db.getPoliciesCollection();
    const policies = await collection.find({ orgId }).sort({ priority: -1 }).toArray();

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(policies));

    return policies;
  }

  async createPolicy(orgId: string, policyData: Omit<Policy, '_id' | 'orgId' | 'createdAt' | 'updatedAt'>): Promise<Policy> {
    const collection = db.getPoliciesCollection();
    const now = new Date();
    
    const policy: Policy = {
      ...policyData,
      orgId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(policy as any);
    const insertedPolicy = await collection.findOne({ _id: result.insertedId });
    
    // Invalidate cache
    const redis = db.getRedis();
    await redis.del(`policies:${orgId}`);

    return insertedPolicy as Policy;
  }

  async evaluate(orgId: string, request: AccessRequest): Promise<PolicyEvaluationResult> {
    const policies = await this.getPoliciesByOrgId(orgId);
    
    // Sort by priority (highest first)
    const sortedPolicies = policies.sort((a, b) => b.priority - a.priority);

    // Evaluate each policy
    for (const policy of sortedPolicies) {
      if (this.matchesPolicy(policy.conditions, request)) {
        return {
          decision: policy.effect,
          matchedPolicyIds: [policy._id?.toString() || ''],
          reason: `Matched policy: ${policy.name}`,
        };
      }
    }

    // Default deny if no policy matches
    return {
      decision: 'DENY',
      matchedPolicyIds: [],
      reason: 'No matching policy found',
    };
  }

  private matchesPolicy(conditions: PolicyCondition, request: AccessRequest): boolean {
    // Check role
    if (conditions.roles && conditions.roles.length > 0) {
      if (!conditions.roles.includes(request.userRole)) {
        return false;
      }
    }

    // Check device trust level
    if (conditions.deviceTrustLevels && conditions.deviceTrustLevels.length > 0) {
      if (!conditions.deviceTrustLevels.includes(request.deviceTrustLevel)) {
        return false;
      }
    }

    // Check country
    if (conditions.countries && conditions.countries.length > 0) {
      if (!conditions.countries.includes(request.country)) {
        return false;
      }
    }

    // Check resource
    if (conditions.resources && conditions.resources.length > 0) {
      if (!conditions.resources.some(r => request.resource.includes(r) || r === '*')) {
        return false;
      }
    }

    // Check time window
    if (conditions.timeWindow) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      const start = conditions.timeWindow.start;
      const end = conditions.timeWindow.end;

      // Simple time comparison (HH:mm format)
      if (currentTime < start || currentTime > end) {
        return false;
      }
    }

    return true;
  }

  async createGateway(orgId: string, gatewayData: { id: string; name: string; apiKey: string }) {
    const collection = db.getGatewaysCollection();
    await collection.insertOne({
      orgId,
      ...gatewayData,
      createdAt: new Date(),
    });
  }

  async getGatewayByApiKey(apiKey: string) {
    const collection = db.getGatewaysCollection();
    return await collection.findOne({ apiKey });
  }
}

export const policyService = new PolicyService();

