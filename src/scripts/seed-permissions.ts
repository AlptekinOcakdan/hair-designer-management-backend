// typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { permissionsTable } from '../infrastructure/databases/drizzle/model';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error(
        'Env variable NEON_DATABASE_URL veya DATABASE_URL bulunamadı. Proje kökünde `./.env` oluşturun ve NEON_DATABASE_URL=<connection-string> ekleyin. Betiği proje kökünden çalıştırın.'
    );
    process.exit(1);
}

export const db = drizzle(neon(connectionString));

const permissions = [
  // Organisation
  { action: 'create_organisation', description: 'Can create a new organisation.' },
  { action: 'update_organisation', description: 'Can update an organisation.' },
  { action: 'get_all_organisations', description: 'Can view all organisations.' },
  { action: 'delete_organisation', description: 'Can delete an organisation.' },
  { action: 'view_organisation_earnings', description: 'Can view earnings reports for an organisation.' },

  // User / Staff
  { action: 'create_and_assign_user_to_salon', description: 'Can create a new user and assign them to a salon.' },
  { action: 'assign_user_to_salon', description: 'Can assign an existing user to a salon.' },
  { action: 'set_user_working_schedule', description: 'Can set a staff member\'s working schedule.' },
  { action: 'set_user_availability', description: 'Can change a staff member\'s availability for appointments.' },
  { action: 'set_user_non_available_range', description: 'Can set a non-available time range for a staff member.' },
  { action: 'staff_add_procedure', description: 'Allows staff to add a procedure they perform.' },
  { action: 'get_staff_procedures_in_salon', description: 'Can view staff and their procedures in a salon.' },
  { action: 'book_appointment', description: 'Can book an appointment.' },
  { action: 'complete_appointment', description: 'Can mark an appointment as completed.' },
  { action: 'request_appointment_cancellation', description: 'Can request to cancel an appointment.' },

  // Salon
  { action: 'create_salon', description: 'Can create a new salon.' },
  { action: 'update_salon', description: 'Can update a salon.' },
  { action: 'get_all_salons', description: 'Can view all salons.' },
  { action: 'get_salons_by_organisation', description: 'Can view salons belonging to an organisation.' },
  { action: 'get_salon_by_id', description: 'Can view a specific salon.' },
  { action: 'delete_salon', description: 'Can delete a salon.' },

  // Procedure
  { action: 'create_procedure', description: 'Can create a new procedure.' },
  { action: 'update_procedure', description: 'Can update a procedure.' },
  { action: 'get_all_procedures', description: 'Can view all procedures.' },
  { action: 'get_procedure_by_id', description: 'Can view a specific procedure.' },
  { action: 'delete_procedure', description: 'Can delete a procedure.' },

  // Role
  { action: 'create_role', description: 'Can create a new role.' },
  { action: 'update_role', description: 'Can update a role.' },
  { action: 'delete_role', description: 'Can delete a role.' },

  // Permission
  { action: 'create_permission', description: 'Can create a new permission.' },
  { action: 'get_all_permissions', description: 'Can view all permissions.' },
  { action: 'get_permission_by_id', description: 'Can view a specific permission.' },
  { action: 'update_permission', description: 'Can update a permission.' },
  { action: 'relate_permission_to_role', description: 'Can relate a permission to a role.' },
  { action: 'delete_permission', description: 'Can delete a permission.' },
];


async function seedPermissions() {
    console.log('Seeding permissions...');
    try {
        await db.insert(permissionsTable).values(permissions).onConflictDoNothing({
            target: permissionsTable.action,
        });
        console.log('Permissions seeded successfully!');
    } catch (error) {
        console.error('Error seeding permissions:', error);
    }
}

seedPermissions().then(() => {
    console.log('Finished.');
    process.exit(0);
});

