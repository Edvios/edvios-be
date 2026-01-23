import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProgramsAndInstitutesService } from './programs-and-institutes.service';
import {
  CreateInstituteDto,
  UpdateInstituteDto,
  CreateProgramDto,
  UpdateProgramDto,
} from './dto';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators';
import { PaginationQueryDto } from './dto/pagination.dto';
import { ProgramFilterDto } from './dto/filter.dto';

@Controller('pai')
export class ProgramsAndInstitutesController {
  constructor(
    private readonly programsAndInstitutesService: ProgramsAndInstitutesService,
  ) {}

  // ============= Institute Endpoints =============

  @Post('institutes')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @HttpCode(HttpStatus.CREATED)
  async createInstitute(@Body() createInstituteDto: CreateInstituteDto) {
    return await this.programsAndInstitutesService.createInstitute(
      createInstituteDto,
    );
  }

  @Get('institutes')
  @UseGuards(JwtAuthGuard)
  async getAllInstitutes(@Query() paginationQuery: PaginationQueryDto) {
    return await this.programsAndInstitutesService.getAllInstitutes(
      paginationQuery,
    );
  }

  @Get('institutes/:id')
  @UseGuards(JwtAuthGuard)
  async getInstituteById(@Param('id') id: string) {
    return await this.programsAndInstitutesService.getInstituteById(id);
  }

  @Put('institutes/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async updateInstitute(
    @Param('id') id: string,
    @Body() updateInstituteDto: UpdateInstituteDto,
  ) {
    return await this.programsAndInstitutesService.updateInstitute(
      id,
      updateInstituteDto,
    );
  }

  @Delete('institutes/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInstitute(@Param('id') id: string) {
    await this.programsAndInstitutesService.deleteInstitute(id);
  }

  // ============= Program Endpoints =============

  //create program
  @Post('programs')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @HttpCode(HttpStatus.CREATED)
  async createProgram(@Body() createProgramDto: CreateProgramDto) {
    return await this.programsAndInstitutesService.createProgram(
      createProgramDto,
    );
  }

  //get all programs
  @Get('programs')
  @UseGuards(JwtAuthGuard)
  async getAllPrograms(@Query() paginationQuery: PaginationQueryDto) {
    return await this.programsAndInstitutesService.getAllPrograms(
      paginationQuery,
    );
  }

  //get initial program data for dropdowns
  @Get('programs/initial-data')
  async getProgramsInitialData() {
    return await this.programsAndInstitutesService.getProgramsInitialData();
  }

  //get programs with the filters
  @Post('programs/filter')
  async getProgramsByFilters(
    @Body() filters: ProgramFilterDto,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.programsAndInstitutesService.getProgramsByFilters(
      filters,
      paginationQuery,
    );
  }

  //get program by id
  @Get('programs/:id')
  @UseGuards(JwtAuthGuard)
  async getProgramById(@Param('id') id: string) {
    return await this.programsAndInstitutesService.getProgramById(id);
  }

  /**
   * update program
   * to update program details send full payload with the fields that changed. otherwise they will be set to null
   */
  @Put('programs/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async updateProgram(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return await this.programsAndInstitutesService.updateProgram(
      id,
      updateProgramDto,
    );
  }

  //delete program
  @Delete('programs/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProgram(@Param('id') id: string) {
    await this.programsAndInstitutesService.deleteProgram(id);
  }
}
