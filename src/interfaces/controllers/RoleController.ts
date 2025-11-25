import { IRoleUseCase } from "../../application/interface/IRoleUseCase";
import { Request, Response, NextFunction } from "express";
import logger from "../logger/Logger";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import { Server } from "../../infrastructure/server/Server";
import { RoleBuilder } from "../../application/builder/RoleBuilder";

export class RoleController {
    constructor(private roleUseCase: IRoleUseCase, private server: Server) {void this.server;}

    async create(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { role } = req.body; // beklenen alan: { role: string }
            const created = await this.roleUseCase.create(role);
            res.status(201).json(created);
        } catch (e) {
            logger.error("Role create method:\n", e);
            next(e);
        }
    }

    async update(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { role, createdAt } = req.body;

            const roleEntity = new RoleBuilder()
                .setId(id)
                .setRole(role)
                .setCreatedAt(createdAt ? new Date(createdAt) : new Date())
                .setUpdatedAt(new Date())
                .build();

            const updated = await this.roleUseCase.update(roleEntity);
            res.status(200).json(updated);
        } catch (e) {
            logger.error("Role update method:\n", e);
            next(e);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const roles = await this.roleUseCase.getAll();
            res.status(200).json(roles);
        } catch (e) {
            logger.error("Role getAll method:\n", e);
            next(e);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const role = await this.roleUseCase.getById(id);

            if (!role) {
                res.sendStatus(404);
                return;
            }

            res.status(200).json(role);
        } catch (e) {
            logger.error("Role getById method:\n", e);
            next(e);
        }
    }

    async delete(req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this.roleUseCase.delete(id);
            res.sendStatus(204);
        } catch (e) {
            logger.error("Role delete method:\n", e);
            next(e);
        }
    }
}
