import { ISalonUseCase } from "../../application/interface/ISalonUseCase";
import { Request, Response, NextFunction } from "express";
import logger from "../logger/Logger";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import { SalonBuilder } from "../../application/builder/SalonBuilder";
import {Server} from "../../infrastructure/server/Server";

export class SalonController {
    constructor(private salonUseCase: ISalonUseCase, private server: Server) {void this.server;}

    async create(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { organisationId, name, location } = req.body;
            // yetki kontrolü AuthMiddleware ile yapılır; req.user mevcut kabul edilir
            const salon = await this.salonUseCase.create(organisationId, name, location);
            res.status(201).json(salon);
        } catch (e) {
            logger.error("Salon create method:\n", e);
            next(e);
        }
    }

    async update(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { name, location, organisationId, createdAt } = req.body;
            // updatedAt controller/use-case tarafından setlenir
            const salonEntity = new SalonBuilder()
                .setId(id)
                .setName(name)
                .setLocation(location)
                .setOrganisationId(organisationId)
                .setCreatedAt(createdAt ? new Date(createdAt) : new Date())
                .setUpdatedAt(new Date())
                .build();

            const updated = await this.salonUseCase.update(salonEntity);
            res.status(200).json(updated);
        } catch (e) {
            logger.error("Salon update method:\n", e);
            next(e);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const salons = await this.salonUseCase.getAll();
            res.status(200).json(salons);
        } catch (e) {
            logger.error("Salon getAll method:\n", e);
            next(e);
        }
    }

    async getByOrganisationId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { organisationId } = req.params;
            const salons = await this.salonUseCase.getByOrganisationId(organisationId);
            res.status(200).json(salons);
        } catch (e) {
            logger.error("Salon getByOrganisationId method:\n", e);
            next(e);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const salon = await this.salonUseCase.getById(id);
            if (!salon) {
                res.sendStatus(404);
                return;
            }
            res.status(200).json(salon);
        } catch (e) {
            logger.error("Salon getById method:\n", e);
            next(e);
        }
    }

    async delete(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this.salonUseCase.delete(id);
            res.sendStatus(204);
        } catch (e) {
            logger.error("Salon delete method:\n", e);
            next(e);
        }
    }
}
