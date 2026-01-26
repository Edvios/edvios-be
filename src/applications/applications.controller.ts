import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { Roles } from 'src/auth/decorators';
import { UserRole } from '@prisma/client';
import { applicationCreateDto } from './dto/application-create.dto';
import { JwtStrategyReturnDto } from 'src/auth/dto/jwt-stratergy-return.dto';
import { ApplicationStatus } from '@prisma/client';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  //get all applications, optional status filter
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  getApplications(@Query('status') status?: ApplicationStatus) {
    return this.applicationsService.getApplications(status);
  }

  //create a new application
  @Post()
  @UseGuards(JwtAuthGuard)
  createApplication(
    @Body() applicationCreateDto: applicationCreateDto,
    @Req() req,
  ) {
    return this.applicationsService.createApplication(
      applicationCreateDto,
      (req as { user: JwtStrategyReturnDto }).user.userId,
    );
  }

  @Get('count')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  getApplicationsCount(@Query('status') status?: ApplicationStatus) {
    return this.applicationsService.getApplicationsCount(status);
  }

  //get all application belonging to a student
  @Get('student/me')
  @UseGuards(JwtAuthGuard)
  getMyApplications(@Req() req) {
    return this.applicationsService.getApplicationsByStudentId(
      (req as { user: JwtStrategyReturnDto }).user.userId,
    );
  }

  //get application by id (student can only get their own application)
  @Get(':id') //here id is application id
  @UseGuards(JwtAuthGuard)
  getApplicationById(@Param('id') id: string, @Req() req) {
    return this.applicationsService.getApplicationById(
      id,
      (req as { user: JwtStrategyReturnDto }).user.userId,
    );
  }

  //get application by id (admin can get any application)
  @Get('admin/:id') //here id is application id
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  getApplicationByIdAdmin(@Param('id') id: string) {
    return this.applicationsService.getApplicationByIdAdmin(id);
  }

  //change the status of an application
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  changeApplicationStatus(
    @Body('status') status: ApplicationStatus,
    @Param('id') id: string,
  ) {
    return this.applicationsService.changeApplicationStatus(status, id);
  }
}
