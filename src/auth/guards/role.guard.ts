import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.role) {
      throw new ForbiddenException('User role not set');
    }

    let userRole = user.role;
    // Treat SELECTED_AGENT as AGENT for role checking
    if(userRole === UserRole.SELECTED_AGENT){
      userRole = UserRole.AGENT;
    }

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `User role ${userRole} is not authorized to access this resource`,
      );
    }

    return true;
  }
}
