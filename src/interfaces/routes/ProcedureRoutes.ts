import { Router } from "express";
import { ProcedureController } from "../controllers/ProcedureController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

export class ProcedureRoutes {
    public router: Router;
    constructor(private procedureController: ProcedureController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Oluşturma yalnızca yetkili kullanıcılar için (POST)
        this.router.post("/", AuthMiddleware, this.procedureController.create.bind(this.procedureController));
        // Güncelleme: artık POST /:id (PUT yasak)
        this.router.post("/:id", AuthMiddleware, this.procedureController.update.bind(this.procedureController));
        // Tüm procedure'lar herkese açık (GET)
        this.router.get("/", this.procedureController.getAll.bind(this.procedureController));
        // Belirli procedure - herkese açık (GET)
        this.router.get("/:id", this.procedureController.getById.bind(this.procedureController));
        // Silme: artık POST /:id/delete (DELETE yasak)
        this.router.post("/:id/delete", AuthMiddleware, this.procedureController.delete.bind(this.procedureController));
    }
}

