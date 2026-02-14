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
import { UserRole, UserStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { generateVerificationToken } from './utils/auth-token.util';

@Injectable()
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private readonly supabase: SupabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    console.log('AuthService.register called for:', registerDto.email);
    const { email, password, firstName, lastName, role, phone } = registerDto;

    try {
      // 1. Check if user already exists in our local database
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException(
          'A user with this email already exists. Please try logging in or use a different email.',
        );
      }

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

      if (error) {
        console.error('Supabase signUp error:', error);
        throw new BadRequestException(error.message);
      }

      if (!data.user) {
        console.error('Supabase user is null');
        throw new BadRequestException('User creation failed in Supabase');
      }

      // Generate verification token
      const tokenData = generateVerificationToken();

      try {
        // Create user in our database with ACTIVE status (but emailVerified: false)
        await this.prisma.user.create({
          data: {
            id: data.user.id,
            email,
            firstName,
            lastName,
            role,
            phone: phone ?? null,
            status: UserStatus.ACTIVE,
            emailVerified: false,
            verificationToken: tokenData.token,
            verificationTokenExpires: tokenData.expires,
          },
        });
      } catch (prismaError) {
        console.error('Prisma creation error:', prismaError);
        throw new BadRequestException(
          'Failed to create user in local database',
        );
      }

      // Send verification email - await it to ensure it finishes or fails visibly
      try {
        await this.mailService.sendVerificationEmail(email, tokenData.token);
      } catch (err) {
        console.error(`Failed to send verification email to ${email}:`, err);
        // Note: we don't throw here to avoid failing registration if only email fails
        // but since we await it, the error will be logged.
      }

      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      throw new BadRequestException(message);
    }
  }

  async createUser(createUserDto: CreateUserDto, creatorUserId: string) {
    console.log(
      'AuthService.createUser called for:',
      createUserDto.email,
      'userId:',
      creatorUserId,
    );
    const { email, firstName, lastName, role, phone } = createUserDto;

    // Generate verification token
    const tokenData = generateVerificationToken();

    try {
      const user = await this.prisma.user.create({
        data: {
          id: creatorUserId,
          email,
          firstName,
          lastName,
          role,
          phone: phone ?? null,
          status: UserStatus.ACTIVE,
          emailVerified: false,
          verificationToken: tokenData.token,
          verificationTokenExpires: tokenData.expires,
        },
      });

      console.log('User created in DB, sending email to:', email);
      // Send verification email
      try {
        await this.mailService.sendVerificationEmail(email, tokenData.token);
        console.log('Verification email sent successfully to:', email);
      } catch (err) {
        console.error(`Failed to send verification email to ${email}:`, err);
      }

      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
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
      console.error('Prisma createUser error:', error);
      throw new BadRequestException('Failed to create user in local database');
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

      // Check if email is verified in our database
      const user = await this.prisma.user.findUnique({
        where: { id: data.user!.id },
      });

      if (user && !user.emailVerified) {
        console.log(
          'Unverified user attempt to login:',
          email,
          'Sending new email.',
        );
        // Send new verification email if they try to login while unverified
        const tokenData = generateVerificationToken();
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            verificationToken: tokenData.token,
            verificationTokenExpires: tokenData.expires,
          },
        });

        try {
          await this.mailService.sendVerificationEmail(email, tokenData.token);
          console.log('Verification email resent on login to:', email);
        } catch (err) {
          console.error('Failed to send verification email on login:', err);
        }

        // Sign the user out of Supabase if they aren't verified in our DB
        await this.supabase.auth.signOut();
        throw new UnauthorizedException(
          'Email not verified. A new verification link has been sent to your email.',
        );
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

      // Update user metadata in Supabase Auth with service role key
      const supabaseAdmin = createClient(
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

  async deleteUser(userId: string) {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    try {
      const { error: supabaseError } =
        await supabaseAdmin.auth.admin.deleteUser(userId);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      await this.prisma.user.delete({
        where: { id: userId },
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

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });
    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const { token: verificationToken, expires: verificationTokenExpires } =
      generateVerificationToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpires,
      },
    });

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error(`Failed to resend verification email to ${email}:`, err);
    }

    return { message: 'Verification email has been resent.' };
  }
}
