import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { agentsGetQueryDto } from './dto/get-agent-query.dto';
import { ApplicationsService } from 'src/applications/applications.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthUser } from 'src/auth/types';
import { AgentProfileData, AgentRegisterDto } from './dto/create-agent.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AgentsService {
  constructor(
    private prisma: PrismaService,
    private applicationsService: ApplicationsService,
    private authService: AuthService,
    private readonly supabaseService: SupabaseService,
  ) { }

  private get supabaseAdmin() {
    return this.supabaseService.adminClient;
  }

  async getPendingAgents() {
    const pendingAgents = await this.prisma.user.findMany({
      where: { role: UserRole.PENDING_AGENT },
    });
    return pendingAgents;
  }

  async getAgentCount() {
    const count = await this.prisma.user.count({
      where: { role: UserRole.AGENT },
    });
    return { agentCount: count };
  }

  async getPendingAgentCount() {
    const count = await this.prisma.user.count({
      where: { role: UserRole.PENDING_AGENT },
    });
    return { pendingAgentCount: count };
  }

  async getAllAgents(agentsGetQuery: agentsGetQueryDto) {
    const { page, size, search, filter } = agentsGetQuery;

    const skip = (Number(page) - 1) * Number(size) || 0;
    const take = Number(size) || 10;

    const where: { [key: string]: unknown } = {};

    if (filter && filter !== 'ALL') where.role = filter;

    if (filter === 'ALL')
      where.role = { in: [UserRole.AGENT, UserRole.PENDING_AGENT] };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [agents, total] = await Promise.all([
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
    return { agents, total, page, size };
  }

  async getDashboardStats() {
    const [
      totalStudents,
      newUsers,
      totalPrograms,
      totalInstitutions,
      totalApplications,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.authService.getNewUsersCount(),
      this.prisma.program.count(),
      this.prisma.institution.count(),
      this.applicationsService.getApplicationsCount(),
    ]);

    return {
      totalStudents,
      newUsers: newUsers.newUsersCount,
      totalPrograms,
      totalInstitutions,
      totalApplications,
    };
  }

  async changeAgentAssignment(assignmentId: string, agentId: string) {
    // Ensure agent exists
    const agent = await this.prisma.user.findUnique({
      where: { id: agentId },
    });
    if (!agent) {
      throw new Error(`Agent ${agentId} not found or not valid`);
    }

    // Change agent assignment
    return this.prisma.agentAssignment.update({
      where: { id: assignmentId },
      data: { agentId },
    });
  }

  async getAgentAssignments(assignedAgentQuery: agentsGetQueryDto) {
    const page = Number(assignedAgentQuery.page) || 1;
    const size = Number(assignedAgentQuery.size) || 10;
    const skip = (page - 1) * size;
    const take = size;
    const where: Prisma.AgentAssignmentWhereInput = {};

    if (assignedAgentQuery.filter) {
      where.agent = {
        user: {
          role:
            assignedAgentQuery.filter === 'ALL'
              ? {
                in: [
                  UserRole.AGENT,
                  UserRole.PENDING_AGENT,
                  UserRole.SELECTED_AGENT,
                ],
              }
              : assignedAgentQuery.filter,
        },
      };
    }

    if (assignedAgentQuery.search) {
      where.OR = [
        {
          student: {
            firstName: {
              contains: assignedAgentQuery.search,
              mode: 'insensitive',
            },
          },
        },
        {
          student: {
            lastName: {
              contains: assignedAgentQuery.search,
              mode: 'insensitive',
            },
          },
        },
        {
          agent: {
            user: {
              firstName: {
                contains: assignedAgentQuery.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          agent: {
            user: {
              lastName: {
                contains: assignedAgentQuery.search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    const assignments = await this.prisma.agentAssignment.findMany({
      where,
      skip,
      take,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          },
        },
        agent: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          },

        },
      },
    });
    return assignments;
  }

  async createAgent(user: AuthUser | undefined, agent: AgentRegisterDto) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const agentData = await this.prisma.$transaction(async (tx) => {

      await tx.agent.create({
        data: {
          legalName: agent.legalName,
          tradingName: agent.tradingName ?? undefined,
          agentName: agent.agentName,
          calendlyLink: agent.calendlyLink ?? undefined,
          countryOfRegistration: agent.countryOfRegistration,
          yearEstablished: agent.yearEstablished ?? undefined,
          websiteUrl: agent.websiteUrl ?? undefined,
          officeAddress: agent.officeAddress,
          contactPersonName: agent.contactPersonName,
          designation: agent.designation ?? undefined,
          officialEmail: agent.officialEmail,
          phoneNumber: agent.phoneNumber,
          businessRegistrationNumber: agent.businessRegistrationNumber,
          businessRegistrationCertificate:
            agent.businessRegistrationCertificate ?? undefined,
          officeAddressProof: agent.officeAddressProof ?? undefined,
          registeredWithEducationCouncils:
            agent.registeredWithEducationCouncils ?? false,
          workingWithUkInstitutions:
            agent.workingWithUkInstitutions ?? false,
          workingWithCanadaInstitutions:
            agent.workingWithCanadaInstitutions ?? false,
          workingWithAustraliaInstitutions:
            agent.workingWithAustraliaInstitutions ?? false,
          primaryStudentMarkets: agent.primaryStudentMarkets ?? [],
          averageStudentsPerYearLast2Years:
            agent.averageStudentsPerYearLast2Years ?? undefined,
          mainDestinations: agent.mainDestinations ?? [],
          typicalStudentProfileStrength:
            agent.typicalStudentProfileStrength ?? undefined,
          inHouseVisaSupport: agent.inHouseVisaSupport ?? false,
          numberOfCounsellors: agent.numberOfCounsellors ?? 1,
          servicesProvided: agent.servicesProvided ?? [],
          reasonToUseEdvios: agent.reasonToUseEdvios ?? undefined,
          interestedFeatures: agent.interestedFeatures ?? [],
          agentTier: agent.agentTier ?? 'BASIC',
          notes: agent.notes ?? undefined,
          user: {
            connect: { id: user.userId },
          },
        },
      });

        await tx.user.update({
          where: { id: user.userId },
          data: { role: UserRole.PENDING_AGENT },
        });

    });

     try {
      const { error: updateError } =
        await this.supabaseAdmin.auth.admin.updateUserById(user.userId, {
          user_metadata: {
            role: UserRole.PENDING_AGENT,
          },
        });

      if (updateError) {
        console.error('Supabase metadata update failed:', updateError);
      }
    } catch (err) {
      console.error('Supabase metadata update threw:', err);
    }

    return agentData;
  }

  async getCalendlyLink(user: AuthUser | undefined) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const agent = await this.prisma.agent.findUnique({
      where: { id: user.userId },
      select: { calendlyLink: true },
    });
    if (!agent) {
      throw new Error('Agent not found');
    }
    return agent.calendlyLink;
  }

  async getAgentById(user: AuthUser | undefined) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const agent = await this.prisma.agent.findUnique({
      where: { id: user.userId },
    });
    if (!agent) {
      throw new Error('Agent not found');
    }
    return agent;
  }

  async updateAgent(user: AuthUser | undefined, agent: AgentProfileData) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    return this.prisma.agent.update({
      where: { id: user.userId },
      data: {
        legalName: agent.legalName,
        tradingName: agent.tradingName ?? undefined,
        agentName: agent.agentName,
        calendlyLink: agent.calendlyLink ?? undefined,
        countryOfRegistration: agent.countryOfRegistration,
        yearEstablished: agent.yearEstablished ?? undefined,
        websiteUrl: agent.websiteUrl ?? undefined,
        officeAddress: agent.officeAddress,
        contactPersonName: agent.contactPersonName,
        designation: agent.designation ?? undefined,
        officialEmail: agent.officialEmail,
        phoneNumber: agent.phoneNumber,
        businessRegistrationNumber: agent.businessRegistrationNumber,
        businessRegistrationCertificate:
          agent.businessRegistrationCertificate ?? undefined,
        officeAddressProof: agent.officeAddressProof ?? undefined,
        registeredWithEducationCouncils:
          agent.registeredWithEducationCouncils ?? false,
        workingWithUkInstitutions:
          agent.workingWithUkInstitutions ?? false,
        workingWithCanadaInstitutions:
          agent.workingWithCanadaInstitutions ?? false,
        workingWithAustraliaInstitutions:
          agent.workingWithAustraliaInstitutions ?? false,
        primaryStudentMarkets: agent.primaryStudentMarkets ?? [],
        averageStudentsPerYearLast2Years:
          agent.averageStudentsPerYearLast2Years ?? undefined,
        mainDestinations: agent.mainDestinations ?? [],
        typicalStudentProfileStrength:
          agent.typicalStudentProfileStrength ?? undefined,
        inHouseVisaSupport: agent.inHouseVisaSupport ?? false,
        numberOfCounsellors: agent.numberOfCounsellors ?? 1,
        servicesProvided: agent.servicesProvided ?? [],
        reasonToUseEdvios: agent.reasonToUseEdvios ?? undefined,
        interestedFeatures: agent.interestedFeatures ?? [],
        agentTier: agent.agentTier ?? 'BASIC',
        notes: agent.notes ?? undefined,
      },
    });
  }

  async getCalendlyLinkForStudent(user: AuthUser | undefined) {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const assignment = await this.prisma.agentAssignment.findFirst({
      where: { studentId: user.userId },
      include: {
        agent: {
          select: {
            calendlyLink: true,
          },
        },
      },
    });
    if (!assignment || !assignment.agent) {
      throw new Error('Agent not found for the student');
    }
    return assignment.agent.calendlyLink;
  }
}