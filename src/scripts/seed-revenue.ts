import { db } from '../config/DrizzleConfig';
import { faker } from '@faker-js/faker';
import { RoleInsert } from '../infrastructure/databases/drizzle/model';
import { rolePermissionsTable } from '../infrastructure/databases/drizzle/model';
import { usersTable } from '../infrastructure/databases/drizzle/model';
import { userRolesTable } from '../infrastructure/databases/drizzle/model';
import { userPermissionsTable } from '../infrastructure/databases/drizzle/model';
import { salonsTable } from '../infrastructure/databases/drizzle/model';
import { salonStaffsTable } from '../infrastructure/databases/drizzle/model';
import { proceduresTable } from '../infrastructure/databases/drizzle/model';
import { staffProceduresTable } from '../infrastructure/databases/drizzle/model';
import { userStaffAppointmentsTable } from '../infrastructure/databases/drizzle/model';
import { eq, inArray } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const ORGANISATION_ID = '95fef7c9-0d4c-43ec-a117-b8e8bf4cdffc';

const NUM_STAFF = 15;
const NUM_CLIENTS = 100;
const NUM_APPOINTMENTS = 500;

const PROCEDURES = [
    { name: 'Saç Kesimi' },
    { name: 'Sakal Tıraşı' },
    { name: 'Saç Yıkama ve Fön' },
    { name: 'Saç Boyama' },
    { name: 'Manikür' },
    { name: 'Pedikür' },
];

const USERS = {
    OWNER: { firstname: 'Cem', lastname: 'Yılmaz', email: 'owner@example.com', phoneNumber: faker.phone.number() },
};

const SALONS = [
    { name: 'Merkez Şube', location: 'İstanbul, Beşiktaş' },
    { name: 'Anadolu Şube', location: 'İstanbul, Kadıköy' },
];

const main = async () => {
    console.log('🚀 Kapsamlı demo veri tohumlama işlemi başlıyor...');

    try {
        // 1. Rolleri roles.json dosyasından al
        console.log('1. Roller roles.json dosyasından yükleniyor...');
        const rolesPath = path.join(__dirname, 'roles.json');
        const rolesFile = fs.readFileSync(rolesPath, 'utf-8');
        const rolesData = JSON.parse(rolesFile);
        const roles: RoleInsert[] = (rolesData as any[]).map(r => ({ id: r.id, role: r.role }));
        const rolesMap = roles.reduce((acc, role) => {
            if (role.role && role.id) { // role.id'nin de var olduğunu kontrol et
                acc[role.role] = role.id;
            }
            return acc;
        }, {} as Record<string, string>);

        if (!rolesMap['OWNER'] || !rolesMap['STAFF'] || !rolesMap['USER']) {
            throw new Error('Gerekli roller (OWNER, STAFF, USER) roles.json dosyasında bulunamadı.');
        }
        console.log('   - Roller başarıyla yüklendi.');

        // 2. Prosedürleri oluştur
        console.log('2. Prosedürler tohumlanıyor...');
        await db.insert(proceduresTable).values(PROCEDURES).onConflictDoNothing();
        const createdProcedures = await db.select().from(proceduresTable).where(inArray(proceduresTable.name, PROCEDURES.map(p => p.name)));
        console.log(`   - ${createdProcedures.length} prosedür mevcut.`);

        // 3. Kullanıcıları oluştur (Sahip, Personel, Müşteriler)
        console.log('3. Kullanıcılar tohumlanıyor...');
        const staffToCreate = Array.from({ length: NUM_STAFF }, (_, i) => ({
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            email: `staff${i + 1}@example.com`,
            phoneNumber: faker.phone.number(),
            role: 'STAFF'
        }));

        const clientsToCreate = Array.from({ length: NUM_CLIENTS }, (_, i) => ({
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            email: `client${i + 1}@example.com`,
            phoneNumber: faker.phone.number(),
            role: 'USER'
        }));

        const allUsersToCreate = [
            { ...USERS.OWNER, role: 'OWNER' },
            ...staffToCreate,
            ...clientsToCreate,
        ];

        const createdUsers = [];
        for (const user of allUsersToCreate) {
            const existingUser = await db.query.usersTable.findFirst({ where: eq(usersTable.email, user.email) });
            if (existingUser) {
                 createdUsers.push({ ...existingUser, role: user.role });
                 continue;
            }
            const newUser = await db.insert(usersTable).values({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                emailVerified: true,
                TOSAccepted: true,
                refreshToken: "seeded_token"
            }).returning();
            createdUsers.push({ ...newUser[0], role: user.role });
        }
        console.log(`   - ${createdUsers.length} kullanıcı hazır.`);

        // 4. Kullanıcılara Rol ve İzinleri Ata
        console.log('4. Roller ve izinler atanıyor...');
        for (const user of createdUsers) {
            const roleId = rolesMap[user.role!];
            if (!roleId) continue;

            await db.insert(userRolesTable).values({
                userId: user.id,
                roleId: roleId,
                organisationId: user.role === 'OWNER' || user.role === 'STAFF' ? ORGANISATION_ID : undefined,
            }).onConflictDoNothing();

            const permissionsForRole = await db.query.rolePermissionsTable.findMany({ where: eq(rolePermissionsTable.roleId, roleId) });
            if (permissionsForRole.length > 0) {
                const userPermissions = permissionsForRole.map(p => ({
                    userId: user.id,
                    permissionId: p.permissionId,
                }));
                await db.insert(userPermissionsTable).values(userPermissions).onConflictDoNothing();
            }
        }
        console.log('   - Roller ve izinler atandı.');

        // 5. Salonları Oluştur
        console.log('5. Salonlar tohumlanıyor...');
        await db.insert(salonsTable).values(SALONS.map(s => ({ ...s, organisationId: ORGANISATION_ID }))).onConflictDoNothing();
        const createdSalons = await db.select().from(salonsTable).where(eq(salonsTable.organisationId, ORGANISATION_ID));
        console.log(`   - Organizasyon için ${createdSalons.length} salon mevcut.`);

        // 6. Personeli Salonlara Ata
        console.log('6. Personel salonlara atanıyor...');
        const staffUsers = createdUsers.filter(u => u.role === 'STAFF');
        if (staffUsers.length > 0 && createdSalons.length > 0) {
            const staffAssignments = staffUsers.map((staff, i) => ({
                userId: staff.id,
                salonId: createdSalons[i % createdSalons.length].id,
                availability: true
            }));
            await db.insert(salonStaffsTable).values(staffAssignments).onConflictDoNothing();
            console.log(`   - ${staffUsers.length} personel salonlara atandı.`);
        } else {
            console.log('   - Atanacak yeni personel veya salon yok.');
        }

        // 7. Personele Prosedürleri Ata
        console.log('7. Personele prosedürler atanıyor...');
        const staffProcedureAssignments = [];
        if (staffUsers.length > 0 && createdProcedures.length > 0) {
            for (const staff of staffUsers) {
                const numProcedures = faker.number.int({ min: 2, max: 5 });
                const proceduresForStaff = faker.helpers.shuffle(createdProcedures).slice(0, numProcedures);
                for (const procedure of proceduresForStaff) {
                    staffProcedureAssignments.push({
                        userId: staff.id,
                        procedureId: procedure.id,
                        duration: faker.number.int({ min: 3, max: 24 }) * 5, // 15dk - 120dk
                        price: faker.commerce.price({ min: 50, max: 500, dec: 0 }) + '.00',
                    });
                }
            }
            await db.insert(staffProceduresTable).values(staffProcedureAssignments).onConflictDoNothing();
            console.log(`   - Personele ${staffProcedureAssignments.length} prosedür ataması yapıldı.`);
        } else {
            console.log('   - Atanacak yeni personel veya prosedür yok.');
        }

        // 8. Randevuları Oluştur
        console.log('8. Randevular tohumlanıyor...');
        const clientUsers = createdUsers.filter(u => u.role === 'USER');
        const appointmentsToCreate = [];
        if (clientUsers.length > 0 && staffUsers.length > 0 && staffProcedureAssignments.length > 0) {
            for (let i = 0; i < NUM_APPOINTMENTS; i++) {
                const randomStaff = faker.helpers.arrayElement(staffUsers);
                const randomClient = faker.helpers.arrayElement(clientUsers);

                const staffProcedures = staffProcedureAssignments.filter(p => p.userId === randomStaff.id);
                if (staffProcedures.length === 0) continue;

                const numProceduresForAppointment = faker.number.int({ min: 1, max: 2 });
                const appointmentProcedures = faker.helpers.shuffle(staffProcedures).slice(0, numProceduresForAppointment);

                if (appointmentProcedures.length > 0) {
                    appointmentsToCreate.push({
                        clientId: randomClient.id,
                        staffId: randomStaff.id,
                        procedureIds: appointmentProcedures.map(p => p.procedureId),
                        appointmentDate: faker.date.past({ years: 1 }),
                        isCompleted: true, // Bütün randevular tamamlandı olarak işaretleniyor
                    });
                }
            }
            if (appointmentsToCreate.length > 0) {
                await db.insert(userStaffAppointmentsTable).values(appointmentsToCreate).onConflictDoNothing();
                console.log(`   - ${appointmentsToCreate.length} randevu tohumlandı.`);
            } else {
                console.log('   - Oluşturulacak yeni randevu yok.');
            }
        } else {
            console.log('   - Randevu oluşturmak için yeterli veri yok.');
        }

        console.log('✅ Demo veri tohumlama başarıyla tamamlandı!');
    } catch (error) {
        console.error('❌ Tohumlama sırasında hata oluştu:', error);
        process.exit(1);
    }
};

main();