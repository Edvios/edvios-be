import 'dotenv/config';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Production-ready: Configure connection pool
    const pool = new Pool({
      connectionString,
      max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Default to 20 clients
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE || '30000', 10), // 30s idle timeout
      connectionTimeoutMillis: parseInt(
        process.env.DB_POOL_TIMEOUT || '2000',
        10,
      ), // 2s connection timeout
    });

    const adapter = new PrismaPg(pool);

    const isProduction = process.env.NODE_ENV === 'production';

    super({
      adapter,
      // Log queries in development for debugging, but only errors/warns in production
      log: isProduction
        ? ['error', 'warn']
        : ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
