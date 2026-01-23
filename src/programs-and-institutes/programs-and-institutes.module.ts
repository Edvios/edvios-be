import { Module } from '@nestjs/common';
import { ProgramsAndInstitutesService } from './programs-and-institutes.service';
import { ProgramsAndInstitutesController } from './programs-and-institutes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProgramsAndInstitutesController],
  providers: [ProgramsAndInstitutesService],
})
export class ProgramsAndInstitutesModule {}
