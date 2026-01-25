import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { agentsGetQueryDto } from './dto/get-agent-query.dto';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

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
}
