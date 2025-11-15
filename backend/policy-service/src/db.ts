import { MongoClient, Db, Collection } from 'mongodb';
import { Policy } from '@sase/shared';
import Redis from 'ioredis';

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private redis: Redis | null = null;

  async initialize() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sase_policies';
    this.client = new MongoClient(mongoUri);
    await this.client.connect();
    this.db = this.client.db();

    // Initialize Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

  }

  getPoliciesCollection(): Collection<Policy> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.collection<Policy>('policies');
  }

  getGatewaysCollection(): Collection<any> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.collection('gateways');
  }

  getRedis(): Redis {
    if (!this.redis) throw new Error('Redis not initialized');
    return this.redis;
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export const db = new Database();

