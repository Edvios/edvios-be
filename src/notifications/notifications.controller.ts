import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('student')
  createStudentNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.createStudentNotification(
      createNotificationDto,
    );
  }

  @Post('agent')
  createAgentNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.createAgentNotification(
      createNotificationDto,
    );
  }

  @Get('student')
  findAllStudentNotifications() {
    return this.notificationsService.findAllStudentNotifications();
  }

  @Get('agent')
  findAllAgentNotifications() {
    return this.notificationsService.findAllAgentNotifications();
  }
}
