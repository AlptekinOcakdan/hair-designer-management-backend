import { IOrganisationUseCase } from "../../application/interface/IOrganisationUseCase";
import { Request, Response, NextFunction } from "express";
import logger from "../logger/Logger";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import {Server} from "../../infrastructure/server/Server";
import { OrganisationBuilder } from "../../application/builder/OrganisationBuilder";

export class OrganisationController {
    constructor(private organisationUseCase: IOrganisationUseCase, private server:Server) {
        void this.server;
    }

    async create(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { name } = req.body;

            const organisation = await this.organisationUseCase.create(userId, name);

            res.status(201).json(organisation);
        } catch (e) {
            logger.error("Organisation create method:\n", e);
            next(e);
        }
    }

    async update(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { name, createdAt } = req.body;
            const { id } = req.params; // id artık params'tan alınıyor

            const orgEntity = new OrganisationBuilder()
                .setId(id)
                .setName(name)
                .setUserId(userId)
                .setCreatedAt(createdAt ? new Date(createdAt) : new Date())
                .setUpdatedAt(new Date())
                .build();

            const updated = await this.organisationUseCase.update(orgEntity);

            res.status(200).json(updated);
        } catch (e) {
            logger.error("Organisation update method:\n", e);
            next(e);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organisations = await this.organisationUseCase.getAll();
            res.status(200).json(organisations);
        } catch (e) {
            logger.error("Organisation getAll method:\n", e);
            next(e);
        }
    }

    async getMyOrganisations(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const organisations = await this.organisationUseCase.getMyOrganisations(userId);
            res.status(200).json(organisations);
        } catch (e) {
            logger.error("Organisation getMyOrganisations method:\n", e);
            next(e);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const organisation = await this.organisationUseCase.getById(id);

            if (!organisation) {
                res.sendStatus(404);
                return;
            }

            res.status(200).json(organisation);
        } catch (e) {
            logger.error("Organisation getById method:\n", e);
            next(e);
        }
    }

    async delete(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            // opsiyonel: doğrulama sahibi kontrolü repository/use-case içinde yapılmalı
            await this.organisationUseCase.delete(id);
            res.sendStatus(204);
        } catch (e) {
            logger.error("Organisation delete method:\n", e);
            next(e);
        }
    }

    // Yeni: getEarnings endpoint'i - sorgu parametreleri ile çalışır
    async getEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params; // organisation id

            const month = typeof req.query.month === 'string' ? req.query.month : undefined;
            const year = typeof req.query.year === 'string' ? req.query.year : undefined;

            // salonIds query paramı virgülle ayrılmış string veya birden fazla param olarak gelebilir
            let salonIds: string[] | undefined;
            const salonIdsRaw = req.query.salonIds;
            if (typeof salonIdsRaw === 'string') {
                salonIds = salonIdsRaw.split(',').map(s => s.trim()).filter(Boolean);
            } else if (Array.isArray(salonIdsRaw)) {
                salonIds = salonIdsRaw.map(String).map(s => s.trim()).filter(Boolean);
            }

            const options: { month?: string; year?: string; salonIds?: string[] } = {};
            if (month) options.month = month;
            if (year) options.year = year;
            if (salonIds && salonIds.length > 0) options.salonIds = salonIds;

            const earnings = await this.organisationUseCase.getEarnings(id, options);

            res.status(200).json(earnings);
        } catch (e) {
            logger.error("Organisation getEarnings method:\n", e);
            next(e);
        }
    }
}
