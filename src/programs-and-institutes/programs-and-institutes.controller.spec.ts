import { Test, TestingModule } from '@nestjs/testing';
import { ProgramsAndInstitutesController } from './programs-and-institutes.controller';
import { ProgramsAndInstitutesService } from './programs-and-institutes.service';

describe('ProgramsAndInstitutesController', () => {
  let controller: ProgramsAndInstitutesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramsAndInstitutesController],
      providers: [ProgramsAndInstitutesService],
    }).compile();

    controller = module.get<ProgramsAndInstitutesController>(
      ProgramsAndInstitutesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
