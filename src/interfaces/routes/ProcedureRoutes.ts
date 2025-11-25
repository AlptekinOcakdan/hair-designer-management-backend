import { Router } from "express";
import { ProcedureController } from "../controllers/ProcedureController";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";
import { AuthorizationMiddleware } from "../middlewares/AuthorizationMiddleware";

export class ProcedureRoutes {
    public router: Router;
    constructor(private procedureController: ProcedureController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Oluşturma yalnızca yetkili kullanıcılar için (POST)
        this.router.post("/", AuthenticationMiddleware, AuthorizationMiddleware("create_procedure"), this.procedureController.create.bind(this.procedureController));
        // Güncelleme: artık POST /:id (PUT yasak)
        this.router.post("/:id", AuthenticationMiddleware, AuthorizationMiddleware("update_procedure"), this.procedureController.update.bind(this.procedureController));
        // Tüm procedure'lar herkese açık (GET)
        this.router.get("/", AuthenticationMiddleware, AuthorizationMiddleware("get_all_procedures"), this.procedureController.getAll.bind(this.procedureController));
        // Belirli procedure - herkese açık (GET)
        this.router.get("/:id", AuthenticationMiddleware, AuthorizationMiddleware("get_procedure_by_id"), this.procedureController.getById.bind(this.procedureController));
        // Silme: artık POST /:id/delete (DELETE yasak)
        this.router.post("/:id/delete", AuthenticationMiddleware, AuthorizationMiddleware("delete_procedure"), this.procedureController.delete.bind(this.procedureController));
    }
}
