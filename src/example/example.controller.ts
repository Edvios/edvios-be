import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Body,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard, RoleGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { UserRole } from '@prisma/client';
import type { AuthUser } from '../auth/types';

/**
 * Example controller showing how to use authentication guards and decorators
 * This is a reference implementation for protecting your routes
 */
@Controller('example')
export class ExampleController {
  // Public route - no authentication required
  @Get('public')
  getPublicData() {
    return { message: 'This is public data' };
  }

  // Protected route - requires authentication
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtectedData(@CurrentUser() user: AuthUser) {
    return {
      message: 'This is protected data',
      accessedBy: user.email,
      userRole: user.role,
    };
  }

  // Admin only route
  @Get('admin-panel')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  getAdminPanel(@CurrentUser() user: AuthUser) {
    return {
      message: 'Welcome to admin panel',
      admin: user.email,
    };
  }

  // Agents and admins only
  @Post('manage-users')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  manageUsers(
    @Body() data: Record<string, unknown>,
    @CurrentUser() user: AuthUser,
  ) {
    return {
      message: 'User management action performed',
      performedBy: user.email,
      role: user.role,
      action: data,
    };
  }

  // Students only
  @Get('student-dashboard')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  getStudentDashboard(@CurrentUser() user: AuthUser) {
    return {
      message: 'Welcome to student dashboard',
      studentEmail: user.email,
    };
  }

  // Multiple roles with different access levels
  @Patch('update-resource/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.STUDENT)
  updateResource(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @CurrentUser() user: AuthUser,
  ) {
    // You can implement different logic based on user role
    if (user.role === UserRole.ADMIN) {
      return { message: 'Admin can update any resource', resourceId: id };
    } else if (user.role === UserRole.AGENT) {
      return { message: 'Agent can update assigned resources', resourceId: id };
    } else {
      return {
        message: 'Student can only update own resources',
        resourceId: id,
      };
    }
  }

  // Get current user info
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUserInfo(@CurrentUser() user: AuthUser) {
    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
  }

  // Delete resource - admin only
  @Delete('delete-resource/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  deleteResource(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return {
      message: 'Resource deleted by admin',
      deletedBy: user.email,
      resourceId: id,
    };
  }
}
