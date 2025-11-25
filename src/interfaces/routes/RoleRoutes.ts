import { Router } from "express";
import { RoleController } from "../controllers/RoleController";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";
import { AuthorizationMiddleware } from "../middlewares/AuthorizationMiddleware";

export class RoleRoutes {
    public router: Router;
    constructor(private roleController: RoleController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Oluşturma yalnızca yetkili kullanıcılar için (POST)
        this.router.post("/", AuthenticationMiddleware, AuthorizationMiddleware("create_role"), this.roleController.create.bind(this.roleController));
        // Güncelleme: artık POST /:id (PUT yasak)
        this.router.post("/:id", AuthenticationMiddleware, AuthorizationMiddleware("update_role"), this.roleController.update.bind(this.roleController));
        // Tüm roller herkese açık (GET)
        this.router.get("/", AuthenticationMiddleware, this.roleController.getAll.bind(this.roleController));
        // Belirli rol - herkese açık (GET)
        this.router.get("/:id", AuthenticationMiddleware, this.roleController.getById.bind(this.roleController));
        // Silme: artık POST /:id/delete (DELETE yasak)
        this.router.post("/:id/delete", AuthenticationMiddleware, AuthorizationMiddleware("delete_role"), this.roleController.delete.bind(this.roleController));
    }
}
