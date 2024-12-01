import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { Oauth2ClientProvider } from 'src/oauth2/oauth2-client.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ContextController],
  providers: [ContextService, Oauth2ClientProvider],
})
export class ContextModule {}
