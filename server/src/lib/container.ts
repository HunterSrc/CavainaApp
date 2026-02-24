import { AuditRepository } from '../modules/admin/audit.repository';
import { AuthRepository } from '../modules/auth/auth.repository';
import { SupersaasService } from '../modules/supersaas/supersaas.service';
import { UsersRepository } from '../modules/users/users.repository';
import { AuthService } from '../modules/auth/auth.service';
import { UsersService } from '../modules/users/users.service';
import { BookingsService } from '../modules/bookings/bookings.service';
import { AvailabilityService } from '../modules/availability/availability.service';
import { AdminService } from '../modules/admin/admin.service';

const usersRepository = new UsersRepository();
const authRepository = new AuthRepository();
const auditRepository = new AuditRepository();
const supersaasService = new SupersaasService();

const usersService = new UsersService(usersRepository, supersaasService);
const authService = new AuthService(usersRepository, authRepository, supersaasService, auditRepository);
const bookingsService = new BookingsService(supersaasService, auditRepository, usersRepository);
const availabilityService = new AvailabilityService(supersaasService);
const adminService = new AdminService(usersRepository, authService, bookingsService, auditRepository, supersaasService);

export const container = {
  repositories: { usersRepository, authRepository, auditRepository },
  services: {
    usersService,
    authService,
    bookingsService,
    availabilityService,
    adminService,
    supersaasService,
  },
};
