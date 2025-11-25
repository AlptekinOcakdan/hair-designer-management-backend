import { db } from '../config/DrizzleConfig';
import { rolesTable } from '../infrastructure/databases/drizzle/model';
import { permissionsTable } from '../infrastructure/databases/drizzle/model';
import { rolePermissionsTable } from '../infrastructure/databases/drizzle/model';

const rolePermissionsMap = {
  OWNER: [
    // Organisation
    'create_organisation', 'update_organisation', 'get_all_organisations', 'get_organisation_by_id', 'view_organisation_earnings', 'delete_organisation',
    // Salon
    'create_salon', 'update_salon', 'get_all_salons', 'get_salons_by_organisation', 'get_salon_by_id', 'delete_salon',
    // User (All)
    'create_and_assign_user_to_salon', 'assign_user_to_salon', 'set_user_working_schedule', 'set_user_availability', 'set_user_non_available_range', 'staff_add_procedure', 'get_staff_procedures_in_salon', 'book_appointment', 'complete_appointment', 'request_appointment_cancellation',
    // Procedure
    'create_procedure', 'update_procedure', 'get_all_procedures', 'get_procedure_by_id', 'delete_procedure',
  ],
  MANAGER: [
    // All User permissions
    'create_and_assign_user_to_salon', 'assign_user_to_salon', 'set_user_working_schedule', 'set_user_availability', 'set_user_non_available_range', 'staff_add_procedure', 'get_staff_procedures_in_salon', 'book_appointment', 'complete_appointment', 'request_appointment_cancellation',
  ],
  STAFF: [
    'set_user_working_schedule',
    'set_user_availability',
    'set_user_non_available_range',
    'staff_add_procedure',
    'complete_appointment',
  ],
  USER: [
    'get_staff_procedures_in_salon',
    'book_appointment',
    'request_appointment_cancellation',
  ],
};

async function seedRolePermissions() {
  console.log('Seeding role-permission relations...');
  try {
    const allRoles = await db.select().from(rolesTable);
    const allPermissions = await db.select().from(permissionsTable);

    const relationsToInsert: { roleId: string; permissionId: string }[] = [];

    for (const role of allRoles) {
      let permissionsForRole: string[] = [];

      if (role.role === 'SYS_ADMIN' || role.role === 'ADMIN') {
        // SYS_ADMIN and ADMIN get all permissions
        permissionsForRole = allPermissions.map(p => p.action);
      } else if (rolePermissionsMap[role.role as keyof typeof rolePermissionsMap]) {
        permissionsForRole = rolePermissionsMap[role.role as keyof typeof rolePermissionsMap];
      }

      if (permissionsForRole.length > 0) {
        const permissionIds = allPermissions
          .filter(p => permissionsForRole.includes(p.action))
          .map(p => p.id);

        for (const permissionId of permissionIds) {
          relationsToInsert.push({
            roleId: role.id,
            permissionId: permissionId,
          });
        }
      }
    }

    if (relationsToInsert.length > 0) {
      await db.insert(rolePermissionsTable).values(relationsToInsert).onConflictDoNothing();
      console.log(`${relationsToInsert.length} role-permission relations have been processed.`);
    } else {
      console.log('No new role-permission relations to seed.');
    }

    console.log('Role-permission seeding finished successfully!');
  } catch (error) {
    console.error('Error seeding role-permission relations:', error);
  }
}

seedRolePermissions().then(() => {
  console.log('Finished.');
  process.exit(0);
});

