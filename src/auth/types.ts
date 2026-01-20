import { UserRole } from '@prisma/client';
import { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
  role?: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
