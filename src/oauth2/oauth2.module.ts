import { Module } from '@nestjs/common';
import { AuthController } from './oauth2.controller.js';
import { OAuth2Service } from './oauth2.service.js';
import { AuthGuard } from './auth.guard.js';
import { APP_GUARD } from '@nestjs/core';

@Module({
  controllers: [AuthController],
  providers: [
    OAuth2Service,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
