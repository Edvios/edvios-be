import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators';
import { UserRole } from '@prisma/client';
import { JwtStrategyReturnDto } from 'src/auth/dto/jwt-stratergy-return.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateStudentDto, @Req() req) {
    return this.studentsService.create(dto, (req as { user: JwtStrategyReturnDto }).user.userId,);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @Req() req: any,
  ) {
    return this.studentsService.update(
      id,
      dto,
      (req as { user: unknown }).user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
