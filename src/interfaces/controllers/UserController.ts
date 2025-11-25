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

    async staffAddPerformedProcedure(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { staffId, procedureId, durationMinutes, price } = req.body;
            await this.userUseCase.staffAddPerformedProcedure(staffId, procedureId, durationMinutes, price);
            res.sendStatus(201);
        } catch (err) {
            logger.error("staffAddPerformedProcedure error:", err);
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

    async bookAppointment(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            // clientId body'de yoksa doğrulanmış kullanıcı id'sini kullan
            const clientId = req.body.clientId ?? req.user?.id;
            const { staffId, procedureIds, appointmentDate } = req.body;
            if (!clientId) throw new Error("ClientId is required");
            await this.userUseCase.bookAppointment(clientId, staffId, procedureIds, appointmentDate);
            res.sendStatus(201);
        } catch (err) {
            logger.error("bookAppointment error:", err);
            next(err);
        }
    }

    async completeAppointment(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { appointmentId } = req.params;
            const { staffId } = req.body;
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
}
