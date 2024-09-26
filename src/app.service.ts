import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService {
  constructor(private supabaseService: SupabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }
  async fetchTable(tableName: string) {
    try {
      const data = await this.supabaseService.getTableData(tableName);
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async fetchProfiles() {
    try {
      const data = await this.supabaseService.getProfilesData();
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
}
