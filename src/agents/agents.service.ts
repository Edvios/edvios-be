import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { agentsGetQueryDto } from './dto/get-agent-query.dto';
import { ApplicationsService } from 'src/applications/applications.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthUser } from 'src/auth/types';
import { AgentRegisterDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    private prisma: PrismaService,
    private applicationsService: ApplicationsService,
    private authService: AuthService,
  ) {}

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
      where: { id: agentId},
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

    return this.prisma.agent.create({
      data: {
        country: agent.country,
        city: agent.city,
        state: agent.state,
        companyName: agent.companyName,
        comment: agent.comment,
        user: {
          connect: { id: user.userId },
        },
      },
    });
  }
}