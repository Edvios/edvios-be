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
  Delete,
  Query,
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
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  //create user after registration
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: AuthUser | undefined) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.authService.getUserById(user.userId);
  }

  //get the total number of users
  @Get('users-count')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return this.authService.getUserCount();
  }

  //new user count
  @Get('new-users-count')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getNewUsersCount() {
    return this.authService.getNewUsersCount();
  }

  //change the role of user
  @Patch('change-role/:userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async changeUserRole(
    @Param('userId') userId: string,
    @Body() body: { role: UserRole },
  ) {
    return this.authService.changeUserRole(userId, body.role);
  }

  @Delete('delete-user/:userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async rejectAgent(@Param('userId') userId: string) {
    return this.authService.deleteUser(userId);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }
}
