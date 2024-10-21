import { Test, TestingModule } from '@nestjs/testing';
import { AllocationController } from './allocation.controller';
import { ConfigService } from '@nestjs/config'; 
import {AllocationService} from './allocation.service';
import { SheetService } from 'src/sheet/sheet.service';

describe('AllocationController', () => {
  let controller: AllocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AllocationController],
    }).compile();
    beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AllocationController],
      providers: [
        AllocationService,
        SheetService,
        {
          provide: ConfigService,
          useValue: {
            // Mock methods if necessary
          },
        },
      ],
    }).compile();

    controller = module.get<AllocationController>(AllocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
