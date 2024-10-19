import { Module } from '@nestjs/common';
import { AuthController } from './oauth2.controller';
import { OAuth2Service } from './oauth2.service';

@Module({
  controllers: [AuthController],
  providers: [OAuth2Service],
})
export class AuthModule {}
