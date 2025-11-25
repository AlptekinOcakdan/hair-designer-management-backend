import { db } from '../config/DrizzleConfig';
import { rolesTable } from '../infrastructure/databases/drizzle/model';

const roles = [
  { role: 'SYS_ADMIN' },
  { role: 'ADMIN' },
  { role: 'OWNER' },
  { role: 'MANAGER' },
  { role: 'STAFF' },
  { role: 'USER' },
];

async function seedRoles() {
  console.log('Seeding roles...');
  try {
    await db.insert(rolesTable).values(roles).onConflictDoNothing({
        target: rolesTable.role
    });
    console.log('Roles seeded successfully!');
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
}

seedRoles().then(() => {
    console.log('Finished seeding roles.');
    process.exit(0);
});

