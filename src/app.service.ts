import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService {
  constructor(private supabaseService: SupabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async fetchData() {
    try {
      const data = await this.supabaseService.getData('profiles');
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
