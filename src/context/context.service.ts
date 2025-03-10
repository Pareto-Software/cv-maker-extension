import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class ContextService {
  async getUserGroups(accessToken: string): Promise<string[]> {
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
