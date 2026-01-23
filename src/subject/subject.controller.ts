import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators';

@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  //create one subject
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  createSubject(@Body() { name }: { name: string }) {
    return this.subjectService.createSubject(name);
  }

  //create multiple subjects
  @Post('many')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  createMultipleSubjects(@Body('subjects') subjects: { name: string }[]) {
    const creationPromises = subjects.map((subject) =>
      this.subjectService.createSubject(subject.name),
    );
    return Promise.all(creationPromises);
  }

  //get all subjects
  @Get()
  getAllSubjects() {
    return this.subjectService.getAllSubjects();
  }

  //delete subject by id
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  deleteSubject(@Param('id') id: string) {
    return this.subjectService.deleteSubject(id);
  }
}
