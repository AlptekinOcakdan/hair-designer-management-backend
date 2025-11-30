import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthenticationMiddleware } from '../middlewares/AuthenticationMiddleware';
import { AuthorizationMiddleware } from '../middlewares/AuthorizationMiddleware';

export class UserRoutes {
  public router: Router;

  constructor(private userController: UserController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * =================================================================
     * BÖLÜM 1: STATİK ROTALAR (En Yüksek Öncelik)
     * Bu rotalar kesin isimlere sahiptir (assign, book, vb.)
     * ve :id gibi parametreler içermez. En üste koyulmalıdır.
     * =================================================================
     */

    // Temel Kullanıcı Listeleme ve Oluşturma
    this.router.post('/', AuthenticationMiddleware, AuthorizationMiddleware('create_user'), this.userController.createUser.bind(this.userController));
    this.router.get('/', AuthenticationMiddleware, AuthorizationMiddleware('get_all_users'), this.userController.getAllUsers.bind(this.userController));

    // Atama ve Oluşturma İşlemleri (ÖNCELİKLİ)
    this.router.post('/create-assign', AuthenticationMiddleware, AuthorizationMiddleware('create_and_assign_user_to_salon'), this.userController.createAndAssignToSalon.bind(this.userController));
    this.router.post('/assign', AuthenticationMiddleware, AuthorizationMiddleware('assign_user_to_salon'), this.userController.assignUserToSalon.bind(this.userController));
    this.router.post('/assign-role', AuthenticationMiddleware, AuthorizationMiddleware('assign_role_to_user'), this.userController.assignRoleToUser.bind(this.userController));

    // Personel ve Prosedür İşlemleri (Ekleme, Listeleme, Güncelleme, Silme)
    this.router.post('/staff/procedure', AuthenticationMiddleware, AuthorizationMiddleware('staff_add_procedure'), this.userController.staffAddPerformedProcedure.bind(this.userController));
    this.router.get('/staff/my-procedures', AuthenticationMiddleware, AuthorizationMiddleware('get_staff_own_procedures'), this.userController.getStaffProcedures.bind(this.userController));
    this.router.put('/staff/procedure/:procedureId', AuthenticationMiddleware, AuthorizationMiddleware('update_staff_procedure'), this.userController.updateStaffProcedure.bind(this.userController));
    this.router.delete('/staff/procedure/:procedureId', AuthenticationMiddleware, AuthorizationMiddleware('delete_staff_procedure'), this.userController.removeStaffProcedure.bind(this.userController));

    this.router.get('/staff/salons', AuthenticationMiddleware, AuthorizationMiddleware('get_staff_salons'), this.userController.getStaffSalons.bind(this.userController));

    // Personelin kendi randevularını görmesi
    this.router.get('/staff/appointments', AuthenticationMiddleware, AuthorizationMiddleware('get_staff_appointments'), this.userController.getStaffAppointments.bind(this.userController));

    // Randevu İşlemleri
    this.router.post('/book', AuthenticationMiddleware, AuthorizationMiddleware('book_appointment'), this.userController.bookAppointment.bind(this.userController));

    /**
     * =================================================================
     * BÖLÜM 2: ÖZEL PARAMETRELİ ROTALAR (Orta Öncelik)
     * Bunlar parametre içerir (:salonId gibi) ancak yanında
     * ek yollar (/schedule, /staff-procedures) olduğu için
     * tek başına duran :id ile çakışmazlar. Yine de güvenli bölgedeler.
     * =================================================================
     */

    // Çalışma Programı ve Uygunluk
    this.router.post('/:salonId/schedule', AuthenticationMiddleware, AuthorizationMiddleware('set_user_working_schedule'), this.userController.setWorkingSchedule.bind(this.userController));
    this.router.post('/:salonId/availability', AuthenticationMiddleware, AuthorizationMiddleware('set_user_availability'), this.userController.setAvailableForAppointments.bind(this.userController));
    this.router.post('/:salonId/non-available', AuthenticationMiddleware, AuthorizationMiddleware('set_user_non_available_range'), this.userController.setNonAvailableRange.bind(this.userController));

    // YENİ: Personel Uygunluk Takvimi
    this.router.get('/salon/:salonId/staff/:staffId/availability', AuthenticationMiddleware, AuthorizationMiddleware('get_staff_availability'), this.userController.getStaffAvailability.bind(this.userController));

    // Alt Kaynaklar (Nested Resources)
    this.router.get('/salon/:salonId/staff-procedures', AuthenticationMiddleware, AuthorizationMiddleware('get_staff_procedures_in_salon'), this.userController.getStaffProceduresInSalon.bind(this.userController));
    this.router.get('/organisation/:organisationId', AuthenticationMiddleware, AuthorizationMiddleware('get_users_by_organisation_id'), this.userController.getUsersByOrganisationId.bind(this.userController));

    // Randevu Detay İşlemleri
    this.router.post('/appointment/:appointmentId/complete', AuthenticationMiddleware, AuthorizationMiddleware('complete_appointment'), this.userController.completeAppointment.bind(this.userController));
    this.router.post('/appointment/:appointmentId/request-cancel', AuthenticationMiddleware, AuthorizationMiddleware('request_appointment_cancellation'), this.userController.requestAppointmentCancellationByUser.bind(this.userController));
    this.router.post('/appointment/:appointmentId/cancel', AuthenticationMiddleware, AuthorizationMiddleware('cancel_appointment'), this.userController.cancelAppointment.bind(this.userController));

    /**
     * =================================================================
     * BÖLÜM 3: GENEL ID ROTALARI (En Düşük Öncelik - "Catch-All")
     * TEHLİKELİ BÖLGE: Bu rotalar sadece bir parametre alır (:id).
     * Eğer bunları yukarı koyarsan, "assign" kelimesini de "id" sanarlar.
     * O yüzden bunlar MUTLAKA EN SONA gelmelidir.
     * =================================================================
     */

    this.router.get('/:id', AuthenticationMiddleware, AuthorizationMiddleware('get_user_by_id'), this.userController.getUserById.bind(this.userController));
    this.router.post('/:id', AuthenticationMiddleware, AuthorizationMiddleware('update_user'), this.userController.updateUser.bind(this.userController));
    this.router.post('/:id/delete', AuthenticationMiddleware, AuthorizationMiddleware('delete_user'), this.userController.deleteUser.bind(this.userController));
  }
}