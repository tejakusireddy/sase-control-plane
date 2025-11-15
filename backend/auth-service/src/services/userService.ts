import bcrypt from 'bcryptjs';
import { db } from '../db';
import { User } from '@sase/shared';

class UserService {
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      orgId: row.org_id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const pool = db.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const users = (rows as any[]).map(row => this.mapRowToUser(row));
    return users[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const pool = db.getPool();
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    const users = (rows as any[]).map(row => this.mapRowToUser(row));
    return users[0] || null;
  }

  async findByOrgId(orgId: string): Promise<User[]> {
    const pool = db.getPool();
    const [rows] = await pool.execute('SELECT * FROM users WHERE org_id = ?', [orgId]);
    return (rows as any[]).map(row => this.mapRowToUser(row));
  }

  async create(userData: {
    id: string;
    orgId: string;
    email: string;
    password: string;
    role: string;
  }): Promise<User> {
    const pool = db.getPool();
    const passwordHash = await this.hashPassword(userData.password);

    await pool.execute(
      'INSERT INTO users (id, org_id, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [userData.id, userData.orgId, userData.email, passwordHash, userData.role]
    );

    const user = await this.findById(userData.id);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export const userService = new UserService();

