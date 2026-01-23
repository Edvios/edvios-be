import { Test, TestingModule } from '@nestjs/testing';
import { IntakesService } from './intakes.service';

describe('IntakesService', () => {
  let service: IntakesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntakesService],
    }).compile();

    service = module.get<IntakesService>(IntakesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
