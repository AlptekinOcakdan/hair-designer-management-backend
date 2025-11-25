import { Request, Response, NextFunction } from 'express';
import { IPermissionUseCase } from '../../application/interface/IPermissionUseCase';
import { NotFoundError } from '../errors/NotFoundError';
import {PermissionBuilder} from "../../application/builder/PermissionBuilder";

export class PermissionController {
    constructor(private permissionUseCase: IPermissionUseCase, private server: any) {void this.server;}

    // Create -> kullanıcının gönderdiği 'action' ile yeni permission oluşturur
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { action } = req.body;
            const created = await this.permissionUseCase.create(action);
            res.status(201).json(created);
        } catch (error) {
            next(error);
        }
    }

    // Get by id
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const found = await this.permissionUseCase.getById(req.params.id);
            if (!found) {
                next(new NotFoundError('Permission not found'));
                return;
            }
            res.status(200).json(found);
        } catch (error) {
            next(error);
        }
    }

    // List all
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const list = await this.permissionUseCase.getAll();
            res.status(200).json(list);
        } catch (error) {
            next(error);
        }
    }

    // Update
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.body;
            const {action, description, createdAt} = req.body;
            const permissionEntity = new PermissionBuilder()
                .setId(id)
                .setAction(action)
                .setDescription(description)
                .setCreatedAt(createdAt)
                .setUpdatedAt(new Date())
                .build();

            const updated = await this.permissionUseCase.update(permissionEntity);
            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    // Delete
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.permissionUseCase.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
