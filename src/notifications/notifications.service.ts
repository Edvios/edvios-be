import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudentNotification(createNotificationDto: CreateNotificationDto) {
    return this.prisma.studentNotification.create({
      data: {
        message: createNotificationDto.message,
      },
    });
  }

  async createAgentNotification(createNotificationDto: CreateNotificationDto) {
    return this.prisma.agentNotification.create({
      data: {
        message: createNotificationDto.message,
      },
    });
  }

  async findAllStudentNotifications() {
    return this.prisma.studentNotification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllAgentNotifications() {
    return this.prisma.agentNotification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

