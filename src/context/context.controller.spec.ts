import { Test, TestingModule } from '@nestjs/testing';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

const mockContextService = {
  getUserGroups: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('manager-group'),
};

describe('ContextController', () => {
  let contextController: ContextController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContextController],
      providers: [
        { provide: ContextService, useValue: mockContextService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    contextController = module.get<ContextController>(ContextController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRole', () => {
    it('should return manager role when user is in manager group', async () => {
      mockContextService.getUserGroups.mockResolvedValue([
        'manager-group',
        'other-group',
      ]);

      const result = await contextController.getRole('Bearer valid-token');

      expect(mockContextService.getUserGroups).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(result).toEqual({ success: true, groups: 'manager' });
    });

    it('should return general role when user is not in manager group', async () => {
      mockContextService.getUserGroups.mockResolvedValue(['general-group']);

      const result = await contextController.getRole('Bearer valid-token');

      expect(mockContextService.getUserGroups).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(result).toEqual({ success: true, groups: 'general' });
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      await expect(contextController.getRole('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when access token is missing', async () => {
      await expect(contextController.getRole('Bearer ')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when getUserGroups throws an error', async () => {
      mockContextService.getUserGroups.mockRejectedValue(
        new Error('Some error'),
      );

      await expect(
        contextController.getRole('Bearer invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
