import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { AuthenticationMiddleware } from '../middlewares/AuthenticationMiddleware';
import { AuthorizationMiddleware } from '../middlewares/AuthorizationMiddleware';

export class PermissionRoutes {
  public router: Router;

  constructor(private permissionController: PermissionController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Oluşturma (POST) - yetkili
    this.router.post('/', AuthenticationMiddleware, AuthorizationMiddleware('create_permission'), this.permissionController.create.bind(this.permissionController));
    // Listeleme (GET) - yetkili
    this.router.get('/', AuthenticationMiddleware, AuthorizationMiddleware('get_all_permissions'), this.permissionController.getAll.bind(this.permissionController));
    // Tekil get (GET) - yetkili
    this.router.get('/:id', AuthenticationMiddleware, AuthorizationMiddleware('get_permission_by_id'), this.permissionController.getById.bind(this.permissionController));
    // Güncelleme (POST /:id) - yetkili
    this.router.post('/:id', AuthenticationMiddleware, AuthorizationMiddleware('update_permission'), this.permissionController.update.bind(this.permissionController));
    // Silme (POST /:id/delete) - yetkili
    this.router.post('/:id/delete', AuthenticationMiddleware, AuthorizationMiddleware('delete_permission'), this.permissionController.delete.bind(this.permissionController));
  }
}
