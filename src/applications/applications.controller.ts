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
import { CurrentUser, Roles } from 'src/auth/decorators';
import { UserRole } from '@prisma/client';
import { applicationCreateDto } from './dto/application-create.dto';
import { JwtStrategyReturnDto } from 'src/auth/dto/jwt-stratergy-return.dto';
import { ApplicationStatus } from '@prisma/client';
import { PaginatioApplicationnQueryDto } from './dto/pagination.dto';
import type { AuthUser } from 'src/auth/types';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

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

  //get all applications by admin, optional status filter
  @Get('admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  getApplications(@Query() query: PaginatioApplicationnQueryDto) {
    return this.applicationsService.getApplications(query);
  }

  //get all application by agent, optional status filter
  @Get('agent')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.AGENT)
  getApplicationsByAgent(
    @Query() query: PaginatioApplicationnQueryDto,
    @CurrentUser() user: AuthUser | undefined,
  ) {
    return this.applicationsService.getApplicationsByAgent(query, user?.userId);
  }

  @Get('count')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  getApplicationsCount() {
    return this.applicationsService.getApplicationsCount();
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
