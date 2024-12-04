import { Module } from '@nestjs/common';
import { AuthController } from './oauth2.controller';
import { OAuth2Service } from './oauth2.service';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { Oauth2ClientProvider } from './oauth2-client.provider';

@Module({
  controllers: [AuthController],
  providers: [
    OAuth2Service,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    Oauth2ClientProvider,
  ],
  exports: [Oauth2ClientProvider],
})
export class AuthModule {}
