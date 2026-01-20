import { UserRole } from '@prisma/client';

export class RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}
