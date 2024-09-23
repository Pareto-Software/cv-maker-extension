import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService {
  constructor(private supabaseService: SupabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async fetchData() {
    const data = await this.supabaseService.getData('some_table');
    return data;
  }
}
