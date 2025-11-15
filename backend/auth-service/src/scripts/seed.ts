import { db } from '../db';
import { organizationService } from '../services/organizationService';
import { userService } from '../services/userService';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase() {
  try {
    const existingOrg = await organizationService.findBySlug('acme');
    if (existingOrg) {
      return;
    }

    const orgId = 'acme';
    await organizationService.create({
      id: orgId,
      name: 'Acme Corp',
      slug: 'acme',
    });

    const userId = uuidv4();
    await userService.create({
      id: userId,
      orgId: orgId,
      email: 'admin@acme.test',
      password: 'Password123!',
      role: 'ORG_ADMIN',
    });

    await userService.create({
      id: uuidv4(),
      orgId: orgId,
      email: 'engineer@acme.test',
      password: 'Password123!',
      role: 'ENGINEER',
    });

    await userService.create({
      id: uuidv4(),
      orgId: orgId,
      email: 'analyst@acme.test',
      password: 'Password123!',
      role: 'SEC_ANALYST',
    });
  } catch (error) {
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  (async () => {
    await db.initialize();
    await seedDatabase();
    await db.close();
    process.exit(0);
  })();
}

