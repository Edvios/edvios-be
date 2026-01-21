import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard, RoleGuard } from './guards';
import { Roles, CurrentUser } from './decorators';
import { UserRole } from '@prisma/client';
import type { AuthUser } from './types';
import { JwtStrategyReturnDto } from './dto/jwt-stratergy-return.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('create-user')
  @UseGuards(JwtAuthGuard)
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.authService.createUser(
      createUserDto,
      (req as { user: JwtStrategyReturnDto }).user.userId,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  //get current user data
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: AuthUser | undefined) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.authService.getUserById(user.userId);
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  adminOnlyRoute(@CurrentUser() user: AuthUser) {
    return {
      message: 'This is admin only route',
      user,
    };
  }

  @Get('agent-or-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  agentOrAdminRoute(@CurrentUser() user: AuthUser) {
    return {
      message: 'This is for admins and agents',
      user,
    };
  }

  @Patch('change-role/:userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async changeUserRole(
    @Param('userId') userId: string,
    @Body() body: { role: UserRole },
  ) {
    return this.authService.changeUserRole(userId, body.role);
  }
}
