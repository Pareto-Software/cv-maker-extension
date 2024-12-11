import { Module } from '@nestjs/common';
import { ContextController } from './context.controller.js';
import { ContextService } from './context.service.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ContextController],
  providers: [ContextService],
})
export class ContextModule {}
