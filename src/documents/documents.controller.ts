import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { CurrentUser, Roles } from 'src/auth/decorators';
import { UserRole } from '@prisma/client';
import { CreateDocumentDto } from './dto';
import type { AuthUser } from 'src/auth/types';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // View own documents (students only)
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  getOwnDocuments(@CurrentUser() user: AuthUser | undefined) {
    return this.documentsService.getOwnDocuments(user?.userId);
  }

  // View documents uploaded by a student (admin/agent only)
  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  getDocumentsByStudent(
    @Param('studentId') studentId: string,
    @CurrentUser() user: AuthUser | undefined,
  ) {
    return this.documentsService.getDocumentsByStudent(studentId, user);
  }

  // Student uploads a document
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  createDocument(
    @CurrentUser() user: AuthUser | undefined,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(user?.userId, dto);
  }

  // Student deletes their own document
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  deleteOwnDocument(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser | undefined,
  ) {
    return this.documentsService.deleteOwnDocument(id, user?.userId);
  }
}
