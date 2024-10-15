import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return "Hello World!" when no headers are provided', () => {
      const result = appController.getHello();  // Call without headers
      expect(result).toEqual({ message: 'Hello World!' });
    });

    it('should return "Hello World!" with the authorization header', () => {
      const headers = { authorization: 'Bearer test-token' };
      const result = appController.getHello(headers);
      expect(result).toEqual({ message: 'Hello World!' });
    });
  });
});

