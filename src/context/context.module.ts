import { Module } from '@nestjs/common';
import { ContextController } from './context.controller.js';
import { ContextService } from './context.service.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../oauth2/oauth2.module.js';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ContextController],
  providers: [ContextService],
})
export class ContextModule {}
