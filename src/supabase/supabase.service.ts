import { Injectable } from '@nestjs/common';
import {SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientProvider } from './supabase-client.provider';
import { Database } from './database.types';
import { ValidTableName } from './table-name.schema';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor(private supabaseClientProvider: SupabaseClientProvider) {
    this.supabase = this.supabaseClientProvider.supabase;
  }

  async getTableData(table: ValidTableName) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) {
      throw new Error(`Error fetching data from ${table}: ${error.message}`);
    }
    return data;
  }

  async getProfilesData() {
    const { data, error } = await this.supabase.from('profiles').select('*');
    if (error) {
      throw new Error(`Error fetching data from profiles: ${error.message}`);
    }
    return data;
  }

  async insertData(table: ValidTableName, values: any) {
    const { data, error } = await this.supabase.from(table).insert(values);
    if (error) {
      throw new Error(`Error inserting data into ${table}: ${error.message}`);
    }
    return data;
  }
}
