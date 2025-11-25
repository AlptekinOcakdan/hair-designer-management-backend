import { Router } from "express";
import { OrganisationController } from "../controllers/OrganisationController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

export class OrganisationRoutes {
    public router: Router;
    constructor(private organisationController: OrganisationController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Oluşturma yalnızca yetkili kullanıcılar için (POST)
        this.router.post("/", AuthMiddleware, this.organisationController.create.bind(this.organisationController));
        // Güncelleme: artık POST /:id (PUT yasak)
        this.router.post("/:id", AuthMiddleware, this.organisationController.update.bind(this.organisationController));
        // Tüm organisation'lar herkese açık (GET)
        this.router.get("/", this.organisationController.getAll.bind(this.organisationController));
        // Kendi organisation'larım - yetkili (GET)
        this.router.get("/me", AuthMiddleware, this.organisationController.getMyOrganisations.bind(this.organisationController));
        // Belirli organisation - herkese açık (GET)
        this.router.get("/:id", this.organisationController.getById.bind(this.organisationController));
        // Earnings: belirli organisation için kazanç raporu (yetkili)
        this.router.get("/:id/earnings", AuthMiddleware, this.organisationController.getEarnings.bind(this.organisationController));
        // Silme: artık POST /:id/delete (DELETE yasak)
        this.router.post("/:id/delete", AuthMiddleware, this.organisationController.delete.bind(this.organisationController));
    }
}
