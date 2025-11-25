import { Router } from "express";
import { SalonController } from "../controllers/SalonController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

export class SalonRoutes {
    public router: Router;
    constructor(private salonController: SalonController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Oluşturma yalnızca yetkili kullanıcılar için (POST)
        this.router.post("/", AuthMiddleware, this.salonController.create.bind(this.salonController));
        // Güncelleme: artık POST /:id (PUT yasak)
        this.router.post("/:id", AuthMiddleware, this.salonController.update.bind(this.salonController));
        // Tüm salonlar herkese açık (GET)
        this.router.get("/", this.salonController.getAll.bind(this.salonController));
        // OrganisationId'ye göre salonlar (GET) - bu route("/:organisation") "/:id" ile çakışmaması için önce tanımlandı
        this.router.get("/organisation/:organisationId", this.salonController.getByOrganisationId.bind(this.salonController));
        // Belirli salon - herkese açık (GET)
        this.router.get("/:id", this.salonController.getById.bind(this.salonController));
        // Silme: artık POST /:id/delete (DELETE yasak)
        this.router.post("/:id/delete", AuthMiddleware, this.salonController.delete.bind(this.salonController));
    }
}

