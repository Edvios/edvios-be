import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    const studentData = this.mapStudentData(dto);

    if (!dto.userId) {
      throw new BadRequestException(
        'Provide either nested `user` or `userId` to link an existing user',
      );
    }

    // Optionally verify user exists
    const exists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!exists) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    return this.prisma.student.create({
      data: {
        ...studentData,
        user: { connect: { id: dto.userId } },
      },
      include: { user: true },
    });
  }

  findAll() {
    return this.prisma.student.findMany({ include: { user: true } });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    // Ensure the student exists
    await this.ensureStudent(id);

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

  private async ensureStudent(id: string) {
    const s = await this.prisma.student.findUnique({ where: { id } });
    if (!s) throw new NotFoundException(`Student ${id} not found`);
  }

  private mapStudentData(dto: Partial<CreateStudentDto | UpdateStudentDto>) {
    return {
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
