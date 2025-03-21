import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private general_role_group: string;
  private manager_role_group: string;
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    const general_role_group =
      this.configService.get<string>('GENERAL_ROLE_GROUP');
    const manager_role_group =
      this.configService.get<string>('MANAGER_ROLE_GROUP');
    if (!general_role_group || !manager_role_group) {
      throw new Error(
        'General Role Group and Manager Role Group must be provided in the env as GENERAL_ROLE_GROUP= and MANAGER_ROLE_GROUP=',
      );
    }
    this.general_role_group = general_role_group;
    this.manager_role_group = manager_role_group;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredGroups: string[] = [];
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('Skipping authentication for public route');
      return true;
    }

    const isManager = this.reflector.getAllAndOverride<boolean>('managerRole', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isManager) {
      requiredGroups.push(this.manager_role_group);
    }

    const request = context.switchToHttp().getRequest();

    // get user access token
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No access token provided');
    }
    const accessToken = authHeader.split(' ')[1];

    // getting the groups the user is part of (list of email strings)
    const userGroups = await this.getUserGroups(accessToken);

    // checking for required groups (in our context this is the manager role group) found at supabase controller
    if (requiredGroups && requiredGroups.length > 0) {
      const isAuthorized = requiredGroups.some((group: string) =>
        userGroups.includes(group),
      );

      if (!isAuthorized) {
        throw new ForbiddenException(
          'Access denied: insufficient group membership',
        );
      }
    } else if (!userGroups.includes(this.general_role_group)) {
      // checking for general role group membership
      throw new ForbiddenException('Access denied: missing general role');
    }

    return true;
  }
  private async getUserGroups(accessToken: string): Promise<string[]> {
    try {
      // Set up OAuth2 client
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      // Obtain the authenticated user's email address
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const userEmail = userInfo.data.email;
      // Use the Cloud Identity API
      const cloudidentity = google.cloudidentity({
        version: 'v1',
        auth: oauth2Client,
      });

      // Search user's groups
      const directRes =
        await cloudidentity.groups.memberships.searchDirectGroups({
          parent: 'groups/-',
          query: `member_key_id=='${userEmail}'`,
        });

      // Search user's transitive groups
      const transitiveRes =
        await cloudidentity.groups.memberships.searchTransitiveGroups({
          parent: 'groups/-',
          query: `member_key_id == '${userEmail}' && 'system/groups/external' in labels`,
        });

      const directGroups = directRes.data.memberships
        ? directRes.data.memberships.map(
            (membership: any) => membership.groupKey.id,
          )
        : [];

      const transitiveGroups = transitiveRes.data.memberships
        ? transitiveRes.data.memberships.map(
            (membership: any) => membership.groupKey.id,
          )
        : [];

      // Combine and remove duplicates using Set
      const allGroups = [...new Set([...directGroups, ...transitiveGroups])];

      return allGroups;
    } catch (error) {
      console.error('Error retrieving user groups:', error);
      throw new ForbiddenException('Unable to retrieve user groups');
    }
  }
}
