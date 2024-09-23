import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ChatGPT generated placeholder code
@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      'failed to get URL from .env';
    const supabaseKey =
      this.configService.get<string>('SUPABASE_KEY') ||
      'failed to get KEY from .env';

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getData(table: string) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) {
      throw new Error(`Error fetching data from ${table}: ${error.message}`);
    }
    return data;
  }

  async insertData(table: string, values: any) {
    const { data, error } = await this.supabase.from(table).insert(values);
    if (error) {
      throw new Error(`Error inserting data into ${table}: ${error.message}`);
    }
    return data;
  }
}
