import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UserRole } from '@prisma/client';
import { studentsGetQueryDto } from './dto/student-query.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto, creatorUserId: string) {
    const studentData = this.mapStudentData(dto);

    if (!creatorUserId) {
      throw new BadRequestException(
        'Provide either nested `user` or `userId` to link an existing user',
      );
    }

    // Optionally verify user exists
    const exists = await this.prisma.user.findUnique({
      where: { id: creatorUserId },
    });
    if (!exists) {
      throw new NotFoundException(`User ${creatorUserId} not found`);
    }

    const student = await this.prisma.student.create({
      data: {
        ...studentData,
        user: { connect: { id: creatorUserId } },
      },
      include: { user: true },
    });

    const agent = await this.prisma.user.findMany({
      where: { role: UserRole.SELECTED_AGENT },
      select: { id: true },
    });

    if (agent.length === 0) {
      throw new BadRequestException('No SELECTED_AGENT found');
    }

    await this.assignAgentToStudent(student.id, agent[0].id);

    return student;
  }

  async assignAgentToStudent(studentId: string, agentId: string) {
    // Ensure both student and agent exist
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }
    const agent = await this.prisma.user.findUnique({
      where: { id: agentId },
    });

    if (!agent || agent.role !== UserRole.SELECTED_AGENT) {
      throw new NotFoundException(`Agent ${agentId} not found or not valid`);
    }
    // Assign agent to student
    return this.prisma.agentAssignment.create({
      data: {
        studentId,
        agentId,
      },
    });
  }

  async findAll(studentsGetQuery: studentsGetQueryDto) {
    const { page, size, search } = studentsGetQuery;

    const skip = (Number(page) - 1) * Number(size) || 0;
    const take = Number(size) || 10;

    const where: { [key: string]: unknown } = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    where.role = UserRole.STUDENT;

    const [students, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { students, total, page, size };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  async update(id: string, dto: UpdateStudentDto, currentUser) {
    // Ensure the student exists
    await this.ensureStudent(id);
    if ((currentUser as { userId: string }).userId !== id) {
      throw new BadRequestException(`You can only update your own profile`);
    }

    const studentData = this.mapStudentData(dto);

    return this.prisma.student.update({
      where: { id },
      data: studentData,
      include: { user: true },
    });
  }

  async remove(id: string) {
    // Ensure the student exists first
    await this.ensureStudent(id);
    return this.prisma.student.delete({
      where: { id },
      include: { user: true },
    });
  }

  async getStudentCount() {
    const count = await this.prisma.user.count({
      where: { role: UserRole.STUDENT },
    });
    return { studentCount: count };
  }

  private async ensureStudent(id: string) {
    const s = await this.prisma.student.findUnique({ where: { id } });
    if (!s) throw new NotFoundException(`Student ${id} not found`);
  }

  private mapStudentData(dto: Partial<CreateStudentDto | UpdateStudentDto>) {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      nationality: dto.nationality ?? null,
      currentEducationLevel: dto.currentEducationLevel ?? null,
      currentInstitution: dto.currentInstitution ?? null,
      fieldOfStudy: dto.fieldOfStudy ?? null,
      gpa: dto.gpa ?? null,
      graduationDate: dto.graduationDate ? new Date(dto.graduationDate) : null,
      preferredDestination: dto.preferredDestination ?? null,
      preferredProgram: dto.preferredProgram ?? null,
      preferredStudyLevel: dto.preferredStudyLevel ?? null,
      preferredIntake: dto.preferredIntake ?? null,
      englishTest: dto.englishTest ?? null,
      englishScore: dto.englishScore ?? null,
      hasValidPassport: dto.hasValidPassport ?? undefined,
      hasAcademicTranscripts: dto.hasAcademicTranscripts ?? undefined,
      hasRecommendationLetters: dto.hasRecommendationLetters ?? undefined,
      hasPersonalStatement: dto.hasPersonalStatement ?? undefined,
      workExperience: dto.workExperience ?? null,
      extraCurricular: dto.extraCurricular ?? null,
      careerGoals: dto.careerGoals ?? null,
      referralSource: dto.referralSource ?? null,
      preferredContactMethod: dto.preferredContactMethod ?? null,
      bestTimeToContact: dto.bestTimeToContact ?? null,
      additionalQuestions: dto.additionalQuestions ?? null,
      dob: dto.dob ? new Date(dto.dob) : null,
      currentCountry: dto.currentCountry ?? null,
      currentCity: dto.currentCity ?? null,
      budgetRange: dto.budgetRange ?? null,
      scholarshipInterest: dto.scholarshipInterest ?? false,
      marketingConsent: dto.marketingConsent ?? false,
    };
  }
}
