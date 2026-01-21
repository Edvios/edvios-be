import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { IntakesService } from './intakes.service';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators';
import { UserRole } from '@prisma/client';

@Controller('intakes')
export class IntakesController {
  constructor(private readonly intakesService: IntakesService) {}

  //create intake
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  create(@Body() createIntakeDto: CreateIntakeDto) {
    return this.intakesService.create(createIntakeDto);
  }

  //create many intakes
  @Post('many')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  createMany(@Body('intakes') intakes: CreateIntakeDto[]) {
    const intakesPromises = intakes.map((dto) =>
      this.intakesService.create(dto),
    );
    return Promise.all(intakesPromises);
  }

  @Get()
  findAll() {
    return this.intakesService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  remove(@Param('id') id: string) {
    return this.intakesService.remove(id);
  }
}
