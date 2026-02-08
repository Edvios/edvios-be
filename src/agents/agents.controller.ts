import { Controller, Get, UseGuards, Query, Patch, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { User, UserRole } from '@prisma/client';
import { agentsGetQueryDto } from './dto/get-agent-query.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  //get all agents, filter and search agents
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllAgents(@Query() agentsGetQuery: agentsGetQueryDto) {
    return this.agentsService.getAllAgents(agentsGetQuery);
  }

  //get the pending agents after registration of agents
  @Get('pending-agents')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getPendingAgents() {
    return this.agentsService.getPendingAgents();
  }

  //get the total number of agents
  @Get('agents-count')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllAgentscount() {
    return this.agentsService.getAgentCount();
  }

  //get the total number of pending agents
  @Get('pending-agents-count')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllPendingAgents() {
    return this.agentsService.getPendingAgentCount();
  }

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async getDashboardStats() {
    return this.agentsService.getDashboardStats();
  }

  @Get('agent-assignments')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAgentAssignments(@Query() assignedAgentQuery: agentsGetQueryDto) {
    return this.agentsService.getAgentAssignments(assignedAgentQuery);
  }

  @Patch('change-assignment/:assignmentId/agent/:agentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async changeAgentAssignment(@Param('assignmentId') assignmentId: string, @Param('agentId') agentId: string) {
    return this.agentsService.changeAgentAssignment(assignmentId, agentId);
  }

}
