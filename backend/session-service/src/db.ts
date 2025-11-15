import mysql from 'mysql2/promise';

class Database {
  private pool: mysql.Pool | null = null;

  async initialize() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'rootpassword',
      database: process.env.MYSQL_DATABASE || 'sase_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await this.createTables();
  }

  private async createTables() {
    if (!this.pool) throw new Error('Database not initialized');

    // Sessions table
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        org_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        gateway_id VARCHAR(255),
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        INDEX idx_org_id (org_id),
        INDEX idx_user_id (user_id),
        INDEX idx_started_at (started_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Policy hits table
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS policy_hits (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        policy_id VARCHAR(255) NOT NULL,
        decision VARCHAR(10) NOT NULL,
        resource VARCHAR(500),
        country VARCHAR(10),
        device_trust_level VARCHAR(20),
        hit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        INDEX idx_session_id (session_id),
        INDEX idx_policy_id (policy_id),
        INDEX idx_hit_at (hit_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Audit logs table
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        org_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(500),
        ip_address VARCHAR(50),
        user_agent TEXT,
        status VARCHAR(50),
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_org_id (org_id),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

  }

  getPool() {
    if (!this.pool) throw new Error('Database not initialized');
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

export const db = new Database();

