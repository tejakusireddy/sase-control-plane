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

    // Organizations table
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Users table
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        org_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
        UNIQUE KEY unique_org_email (org_id, email)
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

