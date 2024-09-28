import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

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

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  async getTableData(table: string) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) {
      throw new Error(`Error fetching data from ${table}: ${error.message}`);
    }
    return data;
  }

  async getProfilesData() {
    const { data, error } = await this.supabase.from("profiles").select('*');
    if (error) {
      throw new Error(`Error fetching data from profiles: ${error.message}`);
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
