import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  GetVerificationKey,
  JwtFromRequestFunction,
  Strategy,
} from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  user_metadata?: {
    role?: UserRole;
  };
}

interface JwtValidatedUser {
  userId: string;
  email: string;
  role?: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');

    if (!supabaseUrl) {
      throw new UnauthorizedException('SUPABASE_URL is not configured');
    }

    const jwtFromRequest: JwtFromRequestFunction = (
      req: Request | undefined,
    ) => {
      const authHeader = req?.headers?.authorization;
      if (typeof authHeader !== 'string') {
        return null;
      }

      const [scheme, token] = authHeader.split(' ');
      return scheme === 'Bearer' ? (token ?? null) : null;
    };

    const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const secretOrKeyProvider = passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri,
    }) as GetVerificationKey;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      jwtFromRequest,
      ignoreExpiration: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      secretOrKeyProvider,
      algorithms: ['ES256'],
    });
  }

  validate(payload: JwtPayload): JwtValidatedUser {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.user_metadata?.role,
    };
  }
}
