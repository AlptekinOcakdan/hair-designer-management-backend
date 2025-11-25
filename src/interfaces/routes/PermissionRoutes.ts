import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

export class PermissionRoutes {
  public router: Router;

  constructor(private permissionController: PermissionController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Oluşturma (POST) - yetkili
    this.router.post('/', AuthMiddleware, this.permissionController.create.bind(this.permissionController));
    // Listeleme (GET) - yetkili
    this.router.get('/', AuthMiddleware, this.permissionController.getAll.bind(this.permissionController));
    // Tekil get (GET) - yetkili
    this.router.get('/:id', AuthMiddleware, this.permissionController.getById.bind(this.permissionController));
    // Güncelleme (POST /:id) - yetkili
    this.router.post('/:id', AuthMiddleware, this.permissionController.update.bind(this.permissionController));
    // Role ilişkilendirme (POST /relate/to-role) - yetkili
    this.router.post('/relate/to-role', AuthMiddleware, this.permissionController.relateToRole.bind(this.permissionController));
    // Silme (POST /:id/delete) - yetkili
    this.router.post('/:id/delete', AuthMiddleware, this.permissionController.delete.bind(this.permissionController));
  }
}
