import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get('/health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'App is running',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
        uptime: {
          type: 'number',
        },
      },
    },
  })
  @HttpCode(200)
  health() {
    return {
      status: 'UP',
      uptime: process.uptime(),
    };
  }
}
