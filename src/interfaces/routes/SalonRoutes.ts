import { Router } from "express";
import { SalonController } from "../controllers/SalonController";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";
import { AuthorizationMiddleware } from "../middlewares/AuthorizationMiddleware";

export class SalonRoutes {
    public router: Router;
    constructor(private salonController: SalonController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Oluşturma yalnızca yetkili kullanıcılar için (POST)
        this.router.post("/", AuthenticationMiddleware, AuthorizationMiddleware("create_salon"), this.salonController.create.bind(this.salonController));
        // Güncelleme: artık POST /:id (PUT yasak)
        this.router.post("/:id", AuthenticationMiddleware, AuthorizationMiddleware("update_salon"), this.salonController.update.bind(this.salonController));
        // Tüm salonlar herkese açık (GET)
        this.router.get("/", AuthenticationMiddleware, AuthorizationMiddleware("get_all_salons"), this.salonController.getAll.bind(this.salonController));
        // OrganisationId'ye göre salonlar (GET) - bu route("/:organisation") "/:id" ile çakışmaması için önce tanımlandı
        this.router.get("/organisation/:organisationId", AuthenticationMiddleware, AuthorizationMiddleware("get_salons_by_organisation"), this.salonController.getByOrganisationId.bind(this.salonController));
        // Belirli salon - herkese açık (GET)
        this.router.get("/:id", AuthenticationMiddleware, AuthorizationMiddleware("get_salon_by_id"), this.salonController.getById.bind(this.salonController));
        // Silme: artık POST /:id/delete (DELETE yasak)
        this.router.post("/:id/delete", AuthenticationMiddleware, AuthorizationMiddleware("delete_salon"), this.salonController.delete.bind(this.salonController));
    }
}
