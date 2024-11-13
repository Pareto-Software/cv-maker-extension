import { Module } from '@nestjs/common';
import { AuthController } from './oauth2.controller.js';
import { OAuth2Service } from './oauth2.service.js';

@Module({
  controllers: [AuthController],
  providers: [OAuth2Service],
})
export class AuthModule {}
