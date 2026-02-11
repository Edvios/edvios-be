import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Prisma, UserRole } from '@prisma/client';
import { studentsGetQueryDto } from './dto/student-query.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto, creatorUserId: string) {
    const studentData = this.mapStudentCreateData(dto);


    if (!creatorUserId) {
      throw new BadRequestException(
        'Provide either nested `user` or `userId` to link an existing user',
      );
    }

    // Verify user exists
    const exists = await this.prisma.user.findUnique({
      where: { id: creatorUserId },
    });
    if (!exists) {
      throw new NotFoundException(`User ${creatorUserId} not found`);
    }

    // Check if student profile already exists for this user
    const existingStudent = await this.prisma.student.findUnique({
      where: { id: creatorUserId },
    });
    if (existingStudent) {
      throw new BadRequestException(
        `Student profile already exists for user ${creatorUserId}`,
      );
    }

    const student = await this.prisma.student.create({
      data: {
        id: creatorUserId,
        ...studentData,
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

    const studentData = this.mapStudentUpdateData(dto);

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

  private mapStudentCreateData(
    dto: CreateStudentDto,
  ): Omit<Prisma.StudentCreateInput, 'user'> {
    const data: Omit<Prisma.StudentCreateInput, 'user'> = {
      // Personal info
      firstName: dto.firstName,
      lastName: dto.lastName,
      dob: dto.dob ? new Date(dto.dob) : undefined,
      gender: dto.gender ?? undefined,
      nationality: dto.nationality,
      passportNumber: dto.passportNumber,
      passportExpiryDate: new Date(dto.passportExpiryDate),
      countryOfResidence: dto.countryOfResidence,

      // Contact
      email: dto.email,
      phone: dto.phone,
      emergencyContact: dto.emergencyContact,

      // Academic background
      highestQualification: dto.highestQualification,
      yearOfCompletion: dto.yearOfCompletion ?? null,
      institutionName: dto.institutionName,
      mediumOfInstruction: dto.mediumOfInstruction ?? null,
      gradesSummary: dto.gradesSummary ?? null,
      academicCertificates: dto.academicCertificates ?? [],

      // English test
      overallScore: dto.overallScore ?? null,
      testExpiryDate: dto.testExpiryDate
        ? new Date(dto.testExpiryDate)
        : null,

      // Study preferences
      intendedIntakeMonth: dto.intendedIntakeMonth ?? null,
      intendedIntakeYear: dto.intendedIntakeYear ?? null,
      preferredCountries: dto.preferredCountries ?? [],
      preferredStudyLevel: dto.preferredStudyLevel ?? null,
      preferredFieldOfStudy: dto.preferredFieldOfStudy,

      // Financial
      estimatedBudget: dto.estimatedBudget ?? null,
      fundingSource: dto.fundingSource ?? null,

      // Visa / immigration
      previousVisaRefusal: dto.previousVisaRefusal ?? false,
      visaRefusalDetails: dto.visaRefusalDetails ?? null,
      travelHistory: dto.travelHistory ?? null,
      ongoingImmigrationApps: dto.ongoingImmigrationApps ?? null,

      // Internal / assessment
      academicFit: dto.academicFit ?? null,
      visaRiskBand: dto.visaRiskBand ?? null,
      notes: dto.notes ?? null,
    };

    if (dto.englishTestTaken !== undefined) {
      data.englishTestTaken = dto.englishTestTaken;
    }

    return data;
  }

  private mapStudentUpdateData(dto: UpdateStudentDto): Prisma.StudentUpdateInput {
    const data: Prisma.StudentUpdateInput = {};

    // Personal info
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.dob !== undefined) data.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.nationality !== undefined) data.nationality = dto.nationality;
    if (dto.passportNumber !== undefined)
      data.passportNumber = dto.passportNumber;
    if (dto.passportExpiryDate !== undefined)
      data.passportExpiryDate = new Date(dto.passportExpiryDate);
    if (dto.countryOfResidence !== undefined)
      data.countryOfResidence = dto.countryOfResidence;

    // Contact
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.emergencyContact !== undefined)
      data.emergencyContact = dto.emergencyContact;

    // Academic background
    if (dto.highestQualification !== undefined)
      data.highestQualification = dto.highestQualification;
    if (dto.yearOfCompletion !== undefined)
      data.yearOfCompletion = dto.yearOfCompletion;
    if (dto.institutionName !== undefined)
      data.institutionName = dto.institutionName;
    if (dto.mediumOfInstruction !== undefined)
      data.mediumOfInstruction = dto.mediumOfInstruction;
    if (dto.gradesSummary !== undefined) data.gradesSummary = dto.gradesSummary;
    if (dto.academicCertificates !== undefined)
      data.academicCertificates = dto.academicCertificates;

    // English test
    if (dto.englishTestTaken !== undefined)
      data.englishTestTaken = dto.englishTestTaken;
    if (dto.overallScore !== undefined) data.overallScore = dto.overallScore;
    if (dto.testExpiryDate !== undefined)
      data.testExpiryDate = dto.testExpiryDate
        ? new Date(dto.testExpiryDate)
        : null;

    // Study preferences
    if (dto.intendedIntakeMonth !== undefined)
      data.intendedIntakeMonth = dto.intendedIntakeMonth;
    if (dto.intendedIntakeYear !== undefined)
      data.intendedIntakeYear = dto.intendedIntakeYear;
    if (dto.preferredCountries !== undefined)
      data.preferredCountries = dto.preferredCountries;
    if (dto.preferredStudyLevel !== undefined)
      data.preferredStudyLevel = dto.preferredStudyLevel;
    if (dto.preferredFieldOfStudy !== undefined)
      data.preferredFieldOfStudy = dto.preferredFieldOfStudy;

    // Financial
    if (dto.estimatedBudget !== undefined)
      data.estimatedBudget = dto.estimatedBudget;
    if (dto.fundingSource !== undefined) data.fundingSource = dto.fundingSource;

    // Visa / immigration
    if (dto.previousVisaRefusal !== undefined)
      data.previousVisaRefusal = dto.previousVisaRefusal;
    if (dto.visaRefusalDetails !== undefined)
      data.visaRefusalDetails = dto.visaRefusalDetails;
    if (dto.travelHistory !== undefined)
      data.travelHistory = dto.travelHistory;
    if (dto.ongoingImmigrationApps !== undefined)
      data.ongoingImmigrationApps = dto.ongoingImmigrationApps;

    // Internal / assessment
    if (dto.academicFit !== undefined) data.academicFit = dto.academicFit;
    if (dto.visaRiskBand !== undefined) data.visaRiskBand = dto.visaRiskBand;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return data;
  }
}
