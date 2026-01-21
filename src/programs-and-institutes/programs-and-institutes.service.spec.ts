import { Test, TestingModule } from '@nestjs/testing';
import { ProgramsAndInstitutesService } from './programs-and-institutes.service';

describe('ProgramsAndInstitutesService', () => {
  let service: ProgramsAndInstitutesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramsAndInstitutesService],
    }).compile();

    service = module.get<ProgramsAndInstitutesService>(
      ProgramsAndInstitutesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
