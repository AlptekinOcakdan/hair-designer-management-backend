import { IProcedureUseCase } from "../../application/interface/IProcedureUseCase";
import { Request, Response, NextFunction } from "express";
import logger from "../logger/Logger";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import { Server } from "../../infrastructure/server/Server";
import {ProcedureBuilder} from "../../application/builder/ProcedureBuilder";

export class ProcedureController {
    constructor(private procedureUseCase: IProcedureUseCase, private server: Server) {void this.server;}

    async create(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name } = req.body;
            const procedure = await this.procedureUseCase.create(name);
            res.status(201).json(procedure);
        } catch (e) {
            logger.error("Procedure create method:\n", e);
            next(e);
        }
    }

    async update(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { name, createdAt } = req.body;

            const procedureEntity = new ProcedureBuilder()
                .setId(id)
                .setName(name)
                .setCreatedAt(createdAt ? new Date(createdAt) : new Date())
                .setUpdatedAt(new Date())
                .build();

            const updated = await this.procedureUseCase.update(procedureEntity);
            res.status(200).json(updated);
        } catch (e) {
            logger.error("Procedure update method:\n", e);
            next(e);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const procedures = await this.procedureUseCase.getAll();
            res.status(200).json(procedures);
        } catch (e) {
            logger.error("Procedure getAll method:\n", e);
            next(e);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const procedure = await this.procedureUseCase.getById(id);

            if (!procedure) {
                res.sendStatus(404);
                return;
            }

            res.status(200).json(procedure);
        } catch (e) {
            logger.error("Procedure getById method:\n", e);
            next(e);
        }
    }

    async delete(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this.procedureUseCase.delete(id);
            res.sendStatus(204);
        } catch (e) {
            logger.error("Procedure delete method:\n", e);
            next(e);
        }
    }
}

