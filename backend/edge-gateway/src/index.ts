import axios from 'axios';
import { AccessRequest, UserRole, DeviceTrustLevel } from '@sase/shared';

const ORG_ID = process.env.ORG_ID || 'acme';
const GATEWAY_ID = process.env.GATEWAY_ID || 'acme-sfo-1';
const GATEWAY_API_KEY = process.env.GATEWAY_API_KEY || 'acme-gw-key-123';
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

// Sample users for synthetic traffic
const SAMPLE_USERS = [
  { id: 'user-1', role: 'ENGINEER' as UserRole },
  { id: 'user-2', role: 'ENGINEER' as UserRole },
  { id: 'user-3', role: 'ORG_ADMIN' as UserRole },
  { id: 'user-4', role: 'SEC_ANALYST' as UserRole },
  { id: 'user-5', role: 'VIEWER' as UserRole },
];

const DEVICE_TRUST_LEVELS: DeviceTrustLevel[] = ['HIGH', 'MEDIUM', 'LOW', 'UNTRUSTED'];
const COUNTRIES = ['US', 'GB', 'CA', 'DE', 'FR', 'CN', 'RU', 'JP'];
const RESOURCES = [
  'ssh://internal.acme.com/server1',
  'ssh://internal.acme.com/server2',
  'https://app.acme.com/dashboard',
  'https://api.acme.com/v1/data',
  'rdp://internal.acme.com/desktop1',
  'vnc://internal.acme.com/monitor1',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateAccessRequest(): AccessRequest {
  const user = getRandomElement(SAMPLE_USERS);
  return {
    userId: user.id,
    userRole: user.role,
    deviceTrustLevel: getRandomElement(DEVICE_TRUST_LEVELS),
    country: getRandomElement(COUNTRIES),
    resource: getRandomElement(RESOURCES),
  };
}

async function evaluateAccess(request: AccessRequest) {
  try {
    const response = await axios.post(
      `${API_GATEWAY_URL}/api/gateway/evaluate`,
      request,
      {
        headers: {
          'X-API-Key': GATEWAY_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Evaluate error:', error.response?.data || error.message);
    throw error;
  }
}

async function recordTelemetry(
  sessionId: string | undefined,
  request: AccessRequest,
  decision: string,
  policyId: string
) {
  try {
    await axios.post(
      `${API_GATEWAY_URL}/api/gateway/telemetry`,
      {
        sessionId,
        orgId: ORG_ID,
        userId: request.userId,
        gatewayId: GATEWAY_ID,
        policyId,
        decision,
        resource: request.resource,
        country: request.country,
        deviceTrustLevel: request.deviceTrustLevel,
      },
      {
        headers: {
          'X-API-Key': GATEWAY_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Telemetry error:', error.response?.data || error.message);
  }
}

async function simulateAccessRequest() {
  const request = generateAccessRequest();
  
  console.log(`\nEvaluating access request:`);
  console.log(`   User: ${request.userId} (${request.userRole})`);
  console.log(`   Resource: ${request.resource}`);
  console.log(`   Country: ${request.country}`);
  console.log(`   Device Trust: ${request.deviceTrustLevel}`);

  try {
    const evaluation = await evaluateAccess(request);
    console.log(`   Decision: ${evaluation.decision}`);
    console.log(`   Matched Policies: ${evaluation.matchedPolicyIds.join(', ')}`);
    if (evaluation.reason) {
      console.log(`   Reason: ${evaluation.reason}`);
    }

    // Record telemetry
    const policyId = evaluation.matchedPolicyIds[0] || 'default-deny';
    await recordTelemetry(undefined, request, evaluation.decision, policyId);
    console.log(`   Telemetry recorded`);
  } catch (error) {
    console.error(`   Failed to process request`);
  }
}

// Main loop
async function main() {
  console.log('Edge Gateway Agent starting...');
  console.log(`   Organization: ${ORG_ID}`);
  console.log(`   Gateway ID: ${GATEWAY_ID}`);
  console.log(`   API Gateway: ${API_GATEWAY_URL}`);
  console.log('\nGenerating synthetic access requests...\n');

  // Generate requests every 3-5 seconds
  setInterval(() => {
    simulateAccessRequest().catch(console.error);
  }, 3000 + Math.random() * 2000);

  // Also run one immediately
  simulateAccessRequest().catch(console.error);
}

main().catch(console.error);

