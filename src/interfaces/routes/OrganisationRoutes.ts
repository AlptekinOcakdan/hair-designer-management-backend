import { Router } from "express";
import { OrganisationController } from "../controllers/OrganisationController";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";
import { AuthorizationMiddleware } from "../middlewares/AuthorizationMiddleware";

export class OrganisationRoutes {
    public router: Router;
    constructor(private organisationController: OrganisationController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Oluşturma yalnızca yetkili kullanıcılar için (POST)
        this.router.post("/", AuthenticationMiddleware, AuthorizationMiddleware("create_organisation"), this.organisationController.create.bind(this.organisationController));
        // Güncelleme: artık POST /:id (PUT yasak)
        this.router.post("/:id", AuthenticationMiddleware, AuthorizationMiddleware("update_organisation"), this.organisationController.update.bind(this.organisationController));
        // Tüm organisation'lar herkese açık (GET)
        this.router.get("/", AuthenticationMiddleware, AuthorizationMiddleware("get_all_organisations"), this.organisationController.getAll.bind(this.organisationController));
        // Kendi organisation'larım - yetkili (GET)
        this.router.get("/me", AuthenticationMiddleware, this.organisationController.getMyOrganisations.bind(this.organisationController));
        // Belirli organisation - herkese açık (GET)
        this.router.get("/:id", AuthenticationMiddleware, AuthorizationMiddleware("get_organisation_by_id"), this.organisationController.getById.bind(this.organisationController));
        // Earnings: belirli organisation için kazanç raporu (yetkili)
        this.router.get("/:id/earnings", AuthenticationMiddleware, AuthorizationMiddleware("view_organisation_earnings"), this.organisationController.getEarnings.bind(this.organisationController));
        // Silme: artık POST /:id/delete (DELETE yasak)
        this.router.post("/:id/delete", AuthenticationMiddleware, AuthorizationMiddleware("delete_organisation"), this.organisationController.delete.bind(this.organisationController));
    }
}
