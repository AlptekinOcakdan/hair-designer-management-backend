import {Request, Response, NextFunction} from "express";
import {Server} from "../../infrastructure/server/Server";
import {NotFoundError} from "../errors/NotFoundError";
import {IUserUseCase} from "../../application/interface/IUserUseCase";
import {ExpressRequestInterface} from "../interface/ExpressRequestInterface";
import {UnAuthorizedError} from "../errors/UnAuthorizedError";
import logger from "../logger/Logger";

export class UserController {
    constructor(private userUseCase: IUserUseCase, private server: Server) {
        void this.server;
    }

    async assignRoleToUser(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, roleId, organisationId, salonId } = req.body;

            // Basit doğrulama
            if (!userId || typeof userId !== 'string') {
                res.status(400).json({ error: 'userId is required and must be a string' });
                return;
            }
            if (!roleId || typeof roleId !== 'string') {
                res.status(400).json({ error: 'roleId is required and must be a string' });
                return;
            }

            await this.userUseCase.assignRoleToUser(userId, roleId, organisationId ?? null, salonId ?? null);
            res.sendStatus(204);
        } catch (err: any) {
            logger.error("assignRoleToUser error:", err);

            const msg = String(err?.message ?? err);
            // Domain level not found errors
            if (msg.includes('User not found')) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            if (msg.includes('Role not found')) {
                res.status(404).json({ error: 'Role not found' });
                return;
            }

            // DB constraint/insert hatalarını ayrıştır
            if (msg.includes('no unique') || msg.includes('constraint') || msg.includes('duplicate') || msg.includes('violat')) {
                res.status(409).json({ error: 'Database constraint error', detail: msg });
                return;
            }

            // Default
            next(err);
        }
    }

    async createUser(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData = req.body;
            const newUser = await this.userUseCase.createUser(userData);
            res.status(201).json(newUser);
        } catch (err: any) {
            logger.error("createUser error:", err);
            if (err.message.includes('required')) {
                res.status(400).json({ error: err.message });
                return;
            }
            next(err);
        }
    }

    async createAndAssignToSalon(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userData, salonId, roleId, staffOptions } = req.body;
            const created = await this.userUseCase.createAndAssignToSalon(userData, salonId, roleId, staffOptions);
            res.status(201).json(created);
        } catch (err) {
            logger.error("createAndAssignToSalon error:", err);
            next(err);
        }
    }

    async assignUserToSalon(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, salonId, roleId, staffOptions } = req.body;
            await this.userUseCase.assignUserToSalon(userId, salonId, roleId, staffOptions);
            res.sendStatus(204);
        } catch (err) {
            logger.error("assignUserToSalon error:", err);
            next(err);
        }
    }

    async setWorkingSchedule(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            // Doğrulanmış kullanıcı id'si kullanılıyor (params'tan alınmayacak)
            const userId = req.user!.id;
            const { salonId } = req.params;
            const { availableWeekDays, availableHours } = req.body;
            await this.userUseCase.setWorkingSchedule(userId, salonId, availableWeekDays, availableHours);
            res.sendStatus(204);
        } catch (err) {
            logger.error("setWorkingSchedule error:", err);
            next(err);
        }
    }

    async setAvailableForAppointments(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { salonId } = req.params;
            const { available } = req.body;
            await this.userUseCase.setAvailableForAppointments(userId, salonId, available);
            res.sendStatus(204);
        } catch (err) {
            logger.error("setAvailableForAppointments error:", err);
            next(err);
        }
    }

    async setNonAvailableRange(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { salonId } = req.params;
            const { start, end, reason } = req.body;
            await this.userUseCase.setNonAvailableRange(userId, salonId, start, end, reason);
            res.sendStatus(204);
        } catch (err) {
            logger.error("setNonAvailableRange error:", err);
            next(err);
        }
    }

    // Personelin kendi prosedürünü listesine eklemesi
    async staffAddPerformedProcedure(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            // Token'dan gelen kullanıcı ID'si kullanılıyor
            const staffId = req.user!.id;
            const { procedureId, durationMinutes, price } = req.body;
            await this.userUseCase.staffAddPerformedProcedure(staffId, procedureId, durationMinutes, price);
            res.sendStatus(201);
        } catch (err) {
            logger.error("staffAddPerformedProcedure error:", err);
            next(err);
        }
    }

    // Personelin kendi prosedürlerini listelemesi
    async getStaffProcedures(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const staffId = req.user!.id;
            const procedures = await this.userUseCase.getStaffProcedures(staffId);
            res.status(200).json(procedures);
        } catch (err) {
            logger.error("getStaffProcedures error:", err);
            next(err);
        }
    }

    // Personelin kendi prosedürünü güncellemesi
    async updateStaffProcedure(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const staffId = req.user!.id;
            const { procedureId } = req.params;
            const { durationMinutes, price } = req.body;
            await this.userUseCase.updateStaffProcedure(staffId, procedureId, durationMinutes, price);
            res.sendStatus(204);
        } catch (err) {
            logger.error("updateStaffProcedure error:", err);
            next(err);
        }
    }

    // Personelin kendi prosedürünü silmesi
    async removeStaffProcedure(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const staffId = req.user!.id;
            const { procedureId } = req.params;
            await this.userUseCase.removeStaffProcedure(staffId, procedureId);
            res.sendStatus(204);
        } catch (err) {
            logger.error("removeStaffProcedure error:", err);
            next(err);
        }
    }

    // Personelin bağlı olduğu salonları getirmesi
    async getStaffSalons(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const staffId = req.user!.id;
            const salons = await this.userUseCase.getStaffSalons(staffId);
            res.status(200).json(salons);
        } catch (err) {
            logger.error("getStaffSalons error:", err);
            next(err);
        }
    }

    async getStaffProceduresInSalon(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { salonId } = req.params;
            const data = await this.userUseCase.getStaffProceduresInSalon(salonId);
            res.status(200).json(data);
        } catch (err) {
            logger.error("getStaffProceduresInSalon error:", err);
            next(err);
        }
    }

    // YENİ: Personelin boş vakitlerini getir
    async getStaffAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { salonId, staffId } = req.params;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                res.status(400).json({ error: "startDate and endDate queries are required." });
                return;
            }

            const data = await this.userUseCase.getStaffAvailability(
                staffId,
                salonId,
                startDate as string,
                endDate as string
            );
            res.status(200).json(data);
        } catch (err: any) {
            logger.error("getStaffAvailability error:", err);
            if(err.message.includes("Staff is not assigned")) {
                res.status(404).json({ error: err.message });
                return;
            }
            next(err);
        }
    }

    async bookAppointment(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            // clientId body'de yoksa doğrulanmış kullanıcı id'sini kullan
            const clientId = req.body.clientId ?? req.user?.id;
            const { staffId, procedureIds, appointmentDate, salonId } = req.body;
            if (!clientId) throw new Error("ClientId is required");

            // GÜNCELLEME: salonId parametresi eklendi (Opsiyonel)
            await this.userUseCase.bookAppointment(clientId, staffId, procedureIds, appointmentDate, salonId);
            res.sendStatus(201);
        } catch (err: any) {
            logger.error("bookAppointment error:", err);
            if (err.message.includes("conflicts") || err.message.includes("dolu") || err.message.includes("çalışma saatleri")) {
                res.status(409).json({ error: err.message });
                return;
            }
            next(err);
        }
    }

    async completeAppointment(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { appointmentId } = req.params;
            // complete işlemi için staffId'yi token'dan alabiliriz veya body'den kontrol edebiliriz.
            // Güvenlik için token tercih edilir.
            const staffId = req.user!.id;
            // const { staffId } = req.body; // Gerekirse body'den de alabiliriz ama token daha güvenli.

            await this.userUseCase.completeAppointment(appointmentId, staffId);
            res.sendStatus(200);
        } catch (err) {
            logger.error("completeAppointment error:", err);
            next(err);
        }
    }

    async requestAppointmentCancellationByUser(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { appointmentId } = req.params;
            const { userId, reason } = req.body;
            await this.userUseCase.requestAppointmentCancellationByUser(appointmentId, userId, reason);
            res.sendStatus(200);
        } catch (err) {
            logger.error("requestAppointmentCancellationByUser error:", err);
            next(err);
        }
    }

    async cancelAppointment(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { appointmentId } = req.params;
            const staffId = req.user!.id; // Staff kendisi iptal ediyor
            const { reason } = req.body;

            if (!reason) {
                res.status(400).json({ error: "Cancellation reason is required" });
                return;
            }

            await this.userUseCase.cancelAppointment(appointmentId, staffId, reason);
            res.sendStatus(200);
        } catch (err) {
            logger.error("cancelAppointment error:", err);
            next(err);
        }
    }

    async getStaffAppointments(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            // Staff ID'yi oturum açmış kullanıcıdan (req.user) alıyoruz
            const staffId = req.user!.id;

            // Opsiyonel tarih parametresi (query string'den: ?date=2023-10-25)
            const date = req.query.date as string | undefined;

            const appointments = await this.userUseCase.getStaffAppointments(staffId, date);
            res.status(200).json(appointments);
        } catch (err) {
            logger.error("getStaffAppointments error:", err);
            next(err);
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await this.userUseCase.getAllUsers();
            res.status(200).json(users);
        } catch (err) {
            logger.error("getAllUsers error:", err);
            next(err);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const user = await this.userUseCase.getUserById(id);
            res.status(200).json(user);
        } catch (err: any) {
            logger.error("getUserById error:", err);
            if (err.message.includes('not found')) {
                res.status(404).json({ error: err.message });
                return;
            }
            next(err);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updatedUser = await this.userUseCase.updateUser(id, req.body);
            res.status(200).json(updatedUser);
        } catch (err: any) {
            logger.error("updateUser error:", err);
            if (err.message.includes('not found')) {
                res.status(404).json({ error: err.message });
                return;
            }
            next(err);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this.userUseCase.deleteUser(id);
            res.sendStatus(204);
        } catch (err: any) {
            logger.error("deleteUser error:", err);
            if (err.message.includes('not found')) {
                res.status(404).json({ error: err.message });
                return;
            }
            next(err);
        }
    }

    async getUsersByOrganisationId(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { organisationId } = req.params;
            const users = await this.userUseCase.getUsersByOrganisationId(organisationId);
            res.status(200).json(users);
        } catch (err) {
            logger.error("getUsersByOrganisationId error:", err);
            next(err);
        }
    }
}