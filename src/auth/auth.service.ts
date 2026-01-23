import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, LoginDto, RegisterDto } from './dto';
import {
  AuthResponse,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private readonly supabase: SupabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );

  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role, phone } = registerDto;

    try {
      const { data, error }: AuthResponse = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role,
          },
        },
      });
      console.log('Supabase signUp data:', data, phone);
      if (error) {
        console.error('Supabase signUp error:', error);
        throw new BadRequestException(error.message);
      }

      return {
        message: 'User registered successfully',
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      throw new BadRequestException(message);
    }
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
        // user: {
        //   id: user.id,
        //   email: user.email,
        //   firstName: user.firstName,
        //   lastName: user.lastName,
        //   role: user.role,
        // },
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

  async refreshToken(refreshToken: string) {
    try {
      const { data, error }: AuthResponse =
        await this.supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (error || !data.session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch {
      throw new UnauthorizedException('Token refresh failed');
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
    try {
      // Update role in Prisma database
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      // Update user metadata in Supabase Auth with service role key
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const supabaseAdmin: SupabaseClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
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

  async getPendingAgents() {
    const pendingAgents = await this.prisma.user.findMany({
      where: { role: UserRole.PENDING_AGENT },
    });
    return pendingAgents;
  }

 async deleteUser(userId: string) {
  const supabaseAdmin: SupabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const { error: supabaseError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

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

}