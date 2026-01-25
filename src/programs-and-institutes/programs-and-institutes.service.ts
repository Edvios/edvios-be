import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInstituteDto,
  UpdateInstituteDto,
  CreateProgramDto,
  UpdateProgramDto,
} from './dto';
import {
  PaginationQueryDto,
  PaginationWithFiltersQueryDto,
} from './dto/pagination.dto';
import { ProgramFilterDto } from './dto/filter.dto';

@Injectable()
export class ProgramsAndInstitutesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============= Institute Operations =============

  async createInstitute(data: CreateInstituteDto) {
    return await this.prisma.institution.create({
      data: {
        ...data,
      },
      include: {
        programs: true,
      },
    });
  }

  async getAllInstitutes(
    paginationQuerywithFilters: PaginationWithFiltersQueryDto,
  ) {
    const page = Number(paginationQuerywithFilters.page) || 1;
    const size = Number(paginationQuerywithFilters.size) || 10;
    const skip = (page - 1) * size;
    const take = size;

    const where: { [key: string]: unknown } = {};

    if (paginationQuerywithFilters.country) {
      where.country = {
        equals: paginationQuerywithFilters.country,
        mode: 'insensitive',
      };
    }
    if (paginationQuerywithFilters.name) {
      where.name = {
        contains: paginationQuerywithFilters.name,
        mode: 'insensitive',
      };
    }
    if (paginationQuerywithFilters.status) {
      where.status = { equals: paginationQuerywithFilters.status };
    }
    if (paginationQuerywithFilters.type) {
      where.type = { equals: paginationQuerywithFilters.type };
    }

    const [institutes, total] = await Promise.all([
      this.prisma.institution.findMany({
        skip,
        take,
        include: {
          programs: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where,
      }),
      this.prisma.institution.count({ where }),
    ]);
    return {
      data: institutes,
      page,
      size,
      total,
    };
  }

  async getInstituteById(id: string) {
    const institute = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        programs: true,
      },
    });

    if (!institute) {
      throw new NotFoundException(`Institute with ID ${id} not found`);
    }

    return {
      id: institute.id,
      name: institute.name,
      type: institute.type,
      country: institute.country,
      city: institute.city,
      ranking: institute.ranking,
      establishedYear: institute.establishedYear,
      totalStudents: institute.totalStudents,
      internationalStudents: institute.internationalStudents,
      programs: institute.programs.length,
      tuitionRange: institute.tuitionRange,
      status: institute.status,
      partnership: institute.partnership,
      contactEmail: institute.contactEmail,
      website: institute.website,
      logo: institute.logo,
      description: institute.description,
      specialties: institute.specialties,
      accreditations: institute.accreditations,
    };
  }

  async updateInstitute(id: string, data: UpdateInstituteDto) {
    const institute = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institute) {
      throw new NotFoundException(`Institute with ID ${id} not found`);
    }

    return await this.prisma.institution.update({
      where: { id },
      data,
      include: {
        programs: true,
      },
    });
  }

  async deleteInstitute(id: string) {
    const institute = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institute) {
      throw new NotFoundException(`Institute with ID ${id} not found`);
    }

    return await this.prisma.institution.delete({
      where: { id },
    });
  }

  // ============= Program Operations =============

  async createProgram(data: CreateProgramDto) {
    // Verify institution exists
    const institution = await this.prisma.institution.findUnique({
      where: { id: data.institutionId },
    });

    if (!institution) {
      throw new NotFoundException(
        `Institution with ID ${data.institutionId} not found`,
      );
    }

    return await this.prisma.program.create({
      data: {
        title: data.title,
        level: data.level,
        intakeId: data.intakeId,
        duration: data.duration,
        tuitionFee: data.tuitionFee,
        applicationFee: data.applicationFee,
        englishTestScore: data.englishTestScore,
        subjectId: data.subjectId,
        scholarship: data.scholarship,
        lastUpdated: new Date(),
        applicationDeadline: new Date(data.applicationDeadline),
        ucasCode: data.ucasCode,
        englishWaiver: data.englishWaiver,
        popularityRank: data.popularityRank,
        status: 'AVAILABLE',
        institutionId: data.institutionId,
      },
      include: {
        institution: true,
      },
    });
  }

  async getAllPrograms(paginationQuery: PaginationQueryDto) {
    const page = Number(paginationQuery.page) || 1;
    const size = Number(paginationQuery.size) || 10;
    const skip = (page - 1) * size;

    const [programs, total] = await Promise.all([
      this.prisma.program.findMany({
        skip,
        take: size,
        include: {
          institution: true,
          intake: true,
          subject: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.program.count(),
    ]);
    return {
      data: programs,
      page,
      size,
      total,
    };
  }

  async getProgramById(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        institution: true,
        intake: true,
        subject: true,
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  async updateProgram(id: string, data: UpdateProgramDto) {
    const program = await this.prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    // If updating institutionId, verify it exists
    if (data.institutionId) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: data.institutionId },
      });

      if (!institution) {
        throw new NotFoundException(
          `Institution with ID ${data.institutionId} not found`,
        );
      }
    }

    const updateData: UpdateProgramDto = { ...data };
    if (data.applicationDeadline) {
      updateData.applicationDeadline = new Date(data.applicationDeadline);
    }
    updateData.updatedAt = new Date();

    return await this.prisma.program.update({
      where: { id },
      data: updateData,
      include: {
        institution: true,
      },
    });
  }

  async deleteProgram(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return await this.prisma.program.delete({
      where: { id },
    });
  }

  async getProgramsInitialData() {
    const subjects = await this.prisma.subject.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });
    const intakes = await this.prisma.intake.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });
    const institutes = await this.prisma.institution.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    const programs = await this.prisma.program.findMany({
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
      },
    });
    return { subjects, intakes, institutes, programs };
  }

  async getProgramsByFilters(
    filters: ProgramFilterDto,
    paginationQuery: PaginationQueryDto,
  ) {
    const page = Number(paginationQuery.page) || 1;
    const size = Number(paginationQuery.size) || 10;
    const skip = (page - 1) * size;

    // Build dynamic `where` object based on filters
    const where: { [key: string]: unknown } = {};

    // Program-level filters
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.intake) {
      where.intakeId = filters.intake;
    }

    if (filters.subjectArea) {
      where.subjectId = filters.subjectArea;
    }

    if (typeof filters.englishWaiver === 'boolean') {
      where.englishWaiver = filters.englishWaiver;
    }

    if (typeof filters.scholarshipAvailable === 'boolean') {
      where.scholarship = filters.scholarshipAvailable;
    }

    // Institution-level filters
    if (filters.institutionId || filters.country) {
      where.institution = {};
      const institutionFilter = where.institution as { [key: string]: string };
      if (filters.institutionId) {
        institutionFilter.id = filters.institutionId;
      }
      if (filters.country) {
        institutionFilter.country = filters.country;
      }
    }

    // Fetch data with pagination
    const [programs, total] = await Promise.all([
      this.prisma.program.findMany({
        where,
        skip,
        take: size,
        include: {
          institution: true,
          intake: true,
          subject: true,
        },
        orderBy: { title: 'asc' },
      }),
      this.prisma.program.count({
        where,
      }),
    ]);

    return {
      data: programs,
      total,
      page,
      size,
    };
  }

  async getProgramsCount() {
    const count = await this.prisma.program.count();
    return { count };
  }

  async getInstitutesCount() {
    const count = await this.prisma.institution.count();
    return { count };
  }
}
