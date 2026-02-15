import {
  Controller,
  Get,
  UseGuards,
  Query,
  Patch,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserRole } from '@prisma/client';
import { agentsGetQueryDto } from './dto/get-agent-query.dto';
import { CurrentUser } from 'src/auth/decorators';
import { AuthUser } from 'src/auth/types';
import { AgentProfileData, AgentRegisterDto } from './dto/create-agent.dto';

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

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAgent(
    @CurrentUser() user: AuthUser | undefined,
    @Body() agent: AgentRegisterDto,
  ) {
    return this.agentsService.createAgent(user, agent);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.AGENT)
  async updateAgent(
    @CurrentUser() user: AuthUser | undefined,
    @Body() agent: AgentProfileData,
  ) {
    return this.agentsService.updateAgent(user, agent);
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

  @Get('calendly-link')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async getCalendlyLink(@CurrentUser() user: AuthUser | undefined) {
    return this.agentsService.getCalendlyLink(user);
  }

  //get the calendly link for a student based on their assigned agent
  @Get('calendly-link-student')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  async getCalendlyLinkForStudent(@CurrentUser() user: AuthUser | undefined) {
    return this.agentsService.getCalendlyLinkForStudent(user);
  }

  @Get('agent/:agentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.AGENT)
  async getAgentById(@CurrentUser() user: AuthUser | undefined) {
    return this.agentsService.getAgentById(user);
  }

  @Patch('change-assignment/:assignmentId/agent/:agentId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async changeAgentAssignment(
    @Param('assignmentId') assignmentId: string,
    @Param('agentId') agentId: string,
  ) {
    return this.agentsService.changeAgentAssignment(assignmentId, agentId);
  }
}
