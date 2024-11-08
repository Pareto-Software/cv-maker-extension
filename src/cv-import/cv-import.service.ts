// cv-import.service.ts
import { Injectable } from '@nestjs/common';
import { SupabaseClientProvider } from '../supabase/supabase-client.provider';

// Implements business logic and data handling.
@Injectable()
export class CvImportService {
  constructor(
    private readonly supabaseClientProvider: SupabaseClientProvider,
  ) {}

  async saveCvData(data: any) {
    const { data: insertedData, error } =
      await this.supabaseClientProvider.supabase.from('cvs').insert(data);

    if (error) throw new Error(`Failed to save CV data: ${error.message}`);
    return insertedData;
  }
}
