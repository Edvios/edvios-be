import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, LoginDto } from './dto';
import { AuthResponse } from '@supabase/supabase-js';
import { UserRole } from '@prisma/client';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.client;
  }

  private get supabaseAdmin() {
    return this.supabaseService.adminClient;
  }

  async createUser(createUserDto: CreateUserDto, creatorUserId: string) {
    const { email, firstName, lastName, role, phone } = createUserDto;

    try {
      const user = await this.prisma.user.create({
        data: {
          id: creatorUserId,
          email,
          firstName,
          lastName,
          role,
          phone: phone ?? null,
        },
      });

      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
        },
      };
    } catch (error) {
      console.error('Supabase createUser error:', error);
      throw new BadRequestException(error);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Authenticate with Supabase
      const { data, error }: AuthResponse =
        await this.supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!data.session) {
        throw new UnauthorizedException('No session returned');
      }

      return {
        message: 'Login successful',
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Authentication failed';
      throw new UnauthorizedException(message);
    }
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async changeUserRole(userId: string, newRole: UserRole) {
    if (newRole === UserRole.SELECTED_AGENT) {
      const existingSelectedAgent = await this.prisma.user.findFirst({
        where: { role: UserRole.SELECTED_AGENT },
      });
      if (existingSelectedAgent) {
        throw new BadRequestException(
          'There is already a user with the SELECTED_AGENT role',
        );
      }
    }
    try {
      // Update role in Prisma database
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      const { error: updateError } =
        await this.supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            role: newRole,
          },
        });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        throw new BadRequestException(
          'Failed to update user metadata in Supabase',
        );
      }

      return {
        message: 'User role updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to change user role';
      throw new BadRequestException(message);
    }
  }

  async deleteUser(userId: string) {
    // const supabaseAdmin = createClient(
    //   process.env.SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // );

    try {
      const { error: supabaseError } =
        await this.supabaseAdmin.auth.admin.deleteUser(userId);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.user.delete({
          where: { id: userId },
        });
      });

      return { message: 'User deleted successfully' };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete user';

      throw new BadRequestException(message);
    }
  }

  async getUserCount() {
    const count = await this.prisma.user.count();
    return { userCount: count };
  }

  async getNewUsersCount() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 1);
    const count = await this.prisma.user.count({
      where: {
        createdAt: { gte: oneWeekAgo },
      },
    });
    return { newUsersCount: count };
  }
}
