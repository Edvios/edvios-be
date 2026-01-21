import { Test, TestingModule } from '@nestjs/testing';
import { IntakesController } from './intakes.controller';
import { IntakesService } from './intakes.service';

describe('IntakesController', () => {
  let controller: IntakesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntakesController],
      providers: [IntakesService],
    }).compile();

    controller = module.get<IntakesController>(IntakesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
