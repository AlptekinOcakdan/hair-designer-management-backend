import { Router } from "express";
import { RoleController } from "../controllers/RoleController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

export class RoleRoutes {
    public router: Router;
    constructor(private roleController: RoleController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Oluşturma yalnızca yetkili kullanıcılar için (POST)
        this.router.post("/", AuthMiddleware, this.roleController.create.bind(this.roleController));
        // Güncelleme: artık POST /:id (PUT yasak)
        this.router.post("/:id", AuthMiddleware, this.roleController.update.bind(this.roleController));
        // Tüm roller herkese açık (GET)
        this.router.get("/", this.roleController.getAll.bind(this.roleController));
        // Belirli rol - herkese açık (GET)
        this.router.get("/:id", this.roleController.getById.bind(this.roleController));
        // Silme: artık POST /:id/delete (DELETE yasak)
        this.router.post("/:id/delete", AuthMiddleware, this.roleController.delete.bind(this.roleController));
    }
}

