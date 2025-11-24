import {Server} from './infrastructure/server/Server';
import {UserController} from './interfaces/controllers/UserController';
import {UserRoutes} from './interfaces/routes/UserRoutes';
import dotenv from 'dotenv';
import {UserRepositoryFactory} from './application/factories/UserRepositoryFactory';
import logger from './interfaces/logger/Logger';
import {db} from "./config/DrizzleConfig";
import {
    organisationsTable, usersTable, salonsTable, proceduresTable, permissionsTable, rolesTable,
    rolePermissionsTable, userPermissionsTable, salonStaffsTable, userStaffAppointmentsTable, staffProceduresTable
} from "./infrastructure/databases/drizzle/model";
import {AuthUseCase} from "./application/use-cases/AuthUseCase";
import {BcryptService} from "./domain/services/concrete/BcryptService";
import {NodemailerService} from "./domain/services/concrete/NodemailerService";
import {AuthController} from "./interfaces/controllers/AuthController";
import {AuthRoutes} from "./interfaces/routes/AuthRoutes";
import {PORT} from "./interfaces/utils/constants";
import {OrganisationRepositoryFactory} from "./application/factories/OrganisationRepositoryFactory";
import {OrganisationUseCase} from "./application/use-cases/OrganisationUseCase";
import {OrganisationController} from "./interfaces/controllers/OrganisationController";
import {OrganisationRoutes} from "./interfaces/routes/OrganisationRoutes";
import { SalonRepositoryFactory } from "./application/factories/SalonRepositoryFactory";
import { SalonUseCase } from "./application/use-cases/SalonUseCase";
import { SalonController } from "./interfaces/controllers/SalonController";
import { SalonRoutes } from "./interfaces/routes/SalonRoutes";
import { ProcedureRepositoryFactory } from "./application/factories/ProcedureRepositoryFactory";
import { ProcedureUseCase } from "./application/use-cases/ProcedureUseCase";
import { ProcedureController } from "./interfaces/controllers/ProcedureController";
import { ProcedureRoutes } from "./interfaces/routes/ProcedureRoutes";
import { PermissionRepositoryFactory } from "./application/factories/PermissionRepositoryFactory";
import { PermissionUseCase } from "./application/use-cases/PermissionUseCase";
import { PermissionController } from "./interfaces/controllers/PermissionController";
import { PermissionRoutes } from "./interfaces/routes/PermissionRoutes";
import { RoleRepositoryFactory } from "./application/factories/RoleRepositoryFactory";
import { RoleUseCase } from "./application/use-cases/RoleUseCase";
import { RoleController } from "./interfaces/controllers/RoleController";
import { RoleRoutes } from "./interfaces/routes/RoleRoutes";
import {RolePermissionRepositoryFactory} from "./application/factories/RolePermissionRepositoryFactory";
import {UserPermissionRepositoryFactory} from "./application/factories/UserPermissionRepositoryFactory";
import {SalonStaffRepositoryFactory} from "./application/factories/SalonStaffRepositoryFactory";
import {UserUseCase} from "./application/use-cases/UserUseCase";
import {UserStaffAppointmentRepositoryFactory} from "./application/factories/UserStaffAppointmentRepositoryFactory";
import {StaffProcedureRepositoryFactory} from "./application/factories/StaffProcedureRepositoryFactory";

dotenv.config();

const startApplication = async () => {
    const port = PORT ? parseInt(PORT) : 5001;

    // SERVICES
    const hashService = new BcryptService();
    const mailService = new NodemailerService();

    // REPOSITORIES
    const userRepository = UserRepositoryFactory.create(db, usersTable);
    const organisationRepository = OrganisationRepositoryFactory.create(db, organisationsTable);
    const salonRepository = SalonRepositoryFactory.create(db, salonsTable);
    const procedureRepository = ProcedureRepositoryFactory.create(db, proceduresTable);
    const permissionRepository = PermissionRepositoryFactory.create(db, permissionsTable);
    const roleRepository = RoleRepositoryFactory.create(db, rolesTable);
    const rolePermissionRepository = RolePermissionRepositoryFactory.create(db, rolePermissionsTable);
    const userPermissionRepository = UserPermissionRepositoryFactory.create(db, userPermissionsTable);
    const salonStaffRepository = SalonStaffRepositoryFactory.create(db, salonStaffsTable);
    const userStaffAppointmentRepository = UserStaffAppointmentRepositoryFactory.create(db, userStaffAppointmentsTable);
    const staffProcedureRepository = StaffProcedureRepositoryFactory.create(db, staffProceduresTable);

    // USE CASES
    const userUseCase = new UserUseCase(userRepository, salonStaffRepository, roleRepository, salonRepository, userStaffAppointmentRepository, mailService, staffProcedureRepository, procedureRepository);
    const authUseCase = new AuthUseCase(userRepository, hashService, mailService);
    const organisationUseCase = new OrganisationUseCase(organisationRepository, salonRepository, salonStaffRepository, userStaffAppointmentRepository, staffProcedureRepository);
    const salonUseCase = new SalonUseCase(salonRepository);
    const procedureUseCase = new ProcedureUseCase(procedureRepository);
    const permissionUseCase = new PermissionUseCase(permissionRepository, rolePermissionRepository, userPermissionRepository, salonStaffRepository);
    const roleUseCase = new RoleUseCase(roleRepository);

    // CONTROLLERS
    const userController = new UserController(userUseCase, null as any);
    const authController = new AuthController(authUseCase, null as any);
    const organisationController = new OrganisationController(organisationUseCase, null as any);
    const salonController = new SalonController(salonUseCase, null as any);
    const procedureController = new ProcedureController(procedureUseCase, null as any);
    const permissionController = new PermissionController(permissionUseCase, null as any);
    const roleController = new RoleController(roleUseCase, null as any);

    // ROUTES
    const userRoutes = new UserRoutes(userController);
    const authRoutes = new AuthRoutes(authController);
    const organisationRoutes = new OrganisationRoutes(organisationController);
    const salonRoutes = new SalonRoutes(salonController);
    const procedureRoutes = new ProcedureRoutes(procedureController);
    const permissionRoutes = new PermissionRoutes(permissionController);
    const roleRoutes = new RoleRoutes(roleController);

    const server = new Server(port, userRoutes, authRoutes, organisationRoutes, salonRoutes, procedureRoutes, roleRoutes, permissionRoutes);
    userController['server'] = server;  // Inject server after initialization
    authController['server'] = server;  // Inject server after initialization
    organisationController['server'] = server;  // Inject server after initialization
    salonController['server'] = server;  // Inject server after initialization
    procedureController['server'] = server;  // Inject server after initialization
    permissionController['server'] = server;  // Inject server after initialization
    roleController['server'] = server;  // Inject server after initialization
    server.start();
};

startApplication().catch((error) => {
    logger.error('Error starting application:', error)
    process.exit(1);
});
