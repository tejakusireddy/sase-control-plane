import { db } from '../db';

class GatewayService {
  async getGatewayByApiKey(apiKey: string) {
    const collection = db.getGatewaysCollection();
    return await collection.findOne({ apiKey });
  }

  async validateApiKey(apiKey: string): Promise<{ orgId: string; gatewayId: string } | null> {
    const gateway = await this.getGatewayByApiKey(apiKey);
    if (!gateway) return null;
    return {
      orgId: gateway.orgId,
      gatewayId: gateway.id,
    };
  }
}

export const gatewayService = new GatewayService();

