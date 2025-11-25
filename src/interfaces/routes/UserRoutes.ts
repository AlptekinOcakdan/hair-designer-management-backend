import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateUserRegister } from '../middlewares/ValidationMiddleware';
import { AuthenticationMiddleware } from '../middlewares/AuthenticationMiddleware';
import { AuthorizationMiddleware } from '../middlewares/AuthorizationMiddleware';

export class UserRoutes {
  public router: Router;

  constructor(private userController: UserController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Yeni kullanıcı oluşturup aynı anda salona ata
    this.router.post('/create-assign', AuthenticationMiddleware, AuthorizationMiddleware('create_and_assign_user_to_salon'), this.userController.createAndAssignToSalon.bind(this.userController));
    // Var olan kullanıcıyı salona ata
    this.router.post('/assign', AuthenticationMiddleware, AuthorizationMiddleware('assign_user_to_salon'), this.userController.assignUserToSalon.bind(this.userController));
    // Kullanıcıya rol ata
    this.router.post('/assign-role', AuthenticationMiddleware, AuthorizationMiddleware('assign_role_to_user'), this.userController.assignRoleToUser.bind(this.userController));
    // Çalışma programı ayarla (authenticated user's id used in controller)
    this.router.post('/:salonId/schedule', AuthenticationMiddleware, AuthorizationMiddleware('set_user_working_schedule'), this.userController.setWorkingSchedule.bind(this.userController));
    // availableForAppointments değiştir
    this.router.post('/:salonId/availability', AuthenticationMiddleware, AuthorizationMiddleware('set_user_availability'), this.userController.setAvailableForAppointments.bind(this.userController));
    // nonAvailableRange ekle / randevuları iptal et
    this.router.post('/:salonId/non-available', AuthenticationMiddleware, AuthorizationMiddleware('set_user_non_available_range'), this.userController.setNonAvailableRange.bind(this.userController));
    // Salon personeli performed procedure ekler
    this.router.post('/staff/procedure', AuthenticationMiddleware, AuthorizationMiddleware('staff_add_procedure'), this.userController.staffAddPerformedProcedure.bind(this.userController));
    // Bir salondaki staff ve onların prosedürleri (GET)
    this.router.get('/salon/:salonId/staff-procedures', AuthenticationMiddleware, AuthorizationMiddleware('get_staff_procedures_in_salon'), this.userController.getStaffProceduresInSalon.bind(this.userController));
    // Randevu oluştur (book)
    this.router.post('/book', AuthenticationMiddleware, AuthorizationMiddleware('book_appointment'), this.userController.bookAppointment.bind(this.userController));
    // Randevu tamamlandı işareti
    this.router.post('/appointment/:appointmentId/complete', AuthenticationMiddleware, AuthorizationMiddleware('complete_appointment'), this.userController.completeAppointment.bind(this.userController));
    // Kullanıcı tarafından iptal talebi gönder
    this.router.post('/appointment/:appointmentId/request-cancel', AuthenticationMiddleware, AuthorizationMiddleware('request_appointment_cancellation'), this.userController.requestAppointmentCancellationByUser.bind(this.userController));
  }
}
