import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateUserRegister } from '../middlewares/ValidationMiddleware';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

export class UserRoutes {
  public router: Router;

  constructor(private userController: UserController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Yeni kullanıcı oluşturup aynı anda salona ata
    this.router.post('/create-assign', AuthMiddleware, this.userController.createAndAssignToSalon.bind(this.userController));
    // Var olan kullanıcıyı salona ata
    this.router.post('/assign', AuthMiddleware, this.userController.assignUserToSalon.bind(this.userController));
    // Çalışma programı ayarla (authenticated user's id used in controller)
    this.router.post('/:salonId/schedule', AuthMiddleware, this.userController.setWorkingSchedule.bind(this.userController));
    // availableForAppointments değiştir
    this.router.post('/:salonId/availability', AuthMiddleware, this.userController.setAvailableForAppointments.bind(this.userController));
    // nonAvailableRange ekle / randevuları iptal et
    this.router.post('/:salonId/non-available', AuthMiddleware, this.userController.setNonAvailableRange.bind(this.userController));
    // Salon personeli performed procedure ekler
    this.router.post('/staff/procedure', AuthMiddleware, this.userController.staffAddPerformedProcedure.bind(this.userController));
    // Bir salondaki staff ve onların prosedürleri (GET)
    this.router.get('/salon/:salonId/staff-procedures', this.userController.getStaffProceduresInSalon.bind(this.userController));
    // Randevu oluştur (book)
    this.router.post('/book', AuthMiddleware, this.userController.bookAppointment.bind(this.userController));
    // Randevu tamamlandı işareti
    this.router.post('/appointment/:appointmentId/complete', AuthMiddleware, this.userController.completeAppointment.bind(this.userController));
    // Kullanıcı tarafından iptal talebi gönder
    this.router.post('/appointment/:appointmentId/request-cancel', AuthMiddleware, this.userController.requestAppointmentCancellationByUser.bind(this.userController));
  }
}
