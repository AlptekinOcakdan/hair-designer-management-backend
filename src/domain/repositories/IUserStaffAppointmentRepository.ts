import { UserStaffAppointment } from '../entities/UserStaffAppointment';

export interface IUserStaffAppointmentRepository {
  create(appointment: UserStaffAppointment): Promise<UserStaffAppointment>;
  findById(id: string): Promise<UserStaffAppointment | null>;
  findAll(): Promise<UserStaffAppointment[]>;
  update(appointment: UserStaffAppointment): Promise<UserStaffAppointment>;
  delete(id: string): Promise<void>;
}

