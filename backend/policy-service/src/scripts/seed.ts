import { db } from '../db';
import { policyService } from '../services/policyService';

export async function seedPolicies() {
  try {
    const policiesCollection = db.getPoliciesCollection();
    const existing = await policiesCollection.findOne({ orgId: 'acme' });
    if (existing) {
      return;
    }

    const orgId = 'acme';

    await policyService.createPolicy(orgId, {
      name: 'Allow Engineers SSH from US',
      priority: 100,
      conditions: {
        roles: ['ENGINEER'],
        countries: ['US'],
        resources: ['ssh://*', 'ssh://internal.acme.com/*'],
        deviceTrustLevels: ['HIGH', 'MEDIUM'],
      },
      effect: 'ALLOW',
      description: 'Allow engineers to access SSH resources from US with trusted devices',
    });

    await policyService.createPolicy(orgId, {
      name: 'Deny Untrusted Devices',
      priority: 200,
      conditions: {
        deviceTrustLevels: ['UNTRUSTED'],
      },
      effect: 'DENY',
      description: 'Block all access from untrusted devices',
    });

    await policyService.createPolicy(orgId, {
      name: 'Allow Admins All Resources',
      priority: 50,
      conditions: {
        roles: ['ORG_ADMIN', 'SUPER_ADMIN'],
      },
      effect: 'ALLOW',
      description: 'Allow admins to access all resources',
    });

    await policyService.createPolicy(orgId, {
      name: 'Block High-Risk Countries',
      priority: 150,
      conditions: {
        countries: ['CN', 'RU', 'KP'],
      },
      effect: 'DENY',
      description: 'Block access from high-risk countries',
    });

    await policyService.createGateway(orgId, {
      id: 'acme-sfo-1',
      name: 'Acme San Francisco Gateway',
      apiKey: 'acme-gw-key-123',
    });
  } catch (error) {
    throw error;
  }
}

