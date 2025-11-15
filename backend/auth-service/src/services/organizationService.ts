import { db } from '../db';
import { Organization } from '@sase/shared';

class OrganizationService {
  private mapRowToOrg(row: any): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Organization | null> {
    const pool = db.getPool();
    const [rows] = await pool.execute('SELECT * FROM organizations WHERE id = ?', [id]);
    const orgs = (rows as any[]).map(row => this.mapRowToOrg(row));
    return orgs[0] || null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const pool = db.getPool();
    const [rows] = await pool.execute('SELECT * FROM organizations WHERE slug = ?', [slug]);
    const orgs = (rows as any[]).map(row => this.mapRowToOrg(row));
    return orgs[0] || null;
  }

  async create(orgData: { id: string; name: string; slug: string }): Promise<Organization> {
    const pool = db.getPool();
    await pool.execute(
      'INSERT INTO organizations (id, name, slug) VALUES (?, ?, ?)',
      [orgData.id, orgData.name, orgData.slug]
    );

    const org = await this.findById(orgData.id);
    if (!org) throw new Error('Failed to create organization');
    return org;
  }

  async getAll(): Promise<Organization[]> {
    const pool = db.getPool();
    const [rows] = await pool.execute('SELECT * FROM organizations');
    return (rows as any[]).map(row => this.mapRowToOrg(row));
  }
}

export const organizationService = new OrganizationService();

