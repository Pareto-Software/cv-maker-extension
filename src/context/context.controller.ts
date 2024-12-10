import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { Public } from '../oauth2/groups.decorator.js';
import { ContextService } from './context.service.js';
import { ConfigService } from '@nestjs/config';

@ApiTags('context')
@Controller()
export class ContextController {
  private manager_role_group: string;
  constructor(
    private readonly contextService: ContextService,
    private readonly configService: ConfigService,
  ) {
    const manager_role_group =
      this.configService.get<string>('MANAGER_ROLE_GROUP');
    if (!manager_role_group) {
      throw new Error(
        'Manager Role Group must be provided in the env as MANAGER_ROLE_GROUP=',
      );
    }
    this.manager_role_group = manager_role_group;
  }

  @Get('role')
  @Public()
  @ApiOperation({
    summary: 'Get User Role',
    description:
      'Fetches the user\'s role based on their group memberships, using the provided authorization token. Supports role-based access control by identifying users as either "manager" or "general".',
  })
  @ApiHeader({
    name: 'authorization',
    description: 'Authorization token in the format: Bearer <access_token>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The user role was successfully retrieved.',
    schema: {
      example: {
        success: true,
        groups: 'manager',
      },
    },
  })
  async getRole(@Headers('authorization') authHeader: string) {
    try {
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header provided');
      }

      // Extract the access token from the Authorization header
      const accessToken = authHeader.replace('Bearer ', '');

      if (!accessToken) {
        throw new UnauthorizedException('No access token provided');
      }

      // Call the service method to get the user's role
      const groups = await this.contextService.getUserGroups(accessToken);

      const role = groups.includes(this.manager_role_group)
        ? 'manager'
        : 'general';

      return {
        success: true,
        groups: role,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Error retrieving role:', error);
      throw new UnauthorizedException('Failed to retrieve user role');
    }
  }
}
