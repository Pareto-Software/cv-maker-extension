import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { Oauth2ClientProvider } from '../oauth2/oauth2-client.provider';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../oauth2/oauth2.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ContextController],
  providers: [ContextService, Oauth2ClientProvider],
})
export class ContextModule {}
