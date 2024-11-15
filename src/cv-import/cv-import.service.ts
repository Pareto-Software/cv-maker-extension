// cv-import.service.ts
import { Injectable } from '@nestjs/common';
import { SupabaseClientProvider } from '../supabase/supabase-client.provider.js';
import { DocumentParserService } from './service/documentParser.service.js';

// Implements business logic and data handling.
@Injectable()
export class CvImportService {
  constructor(
    private readonly supabaseClientProvider: SupabaseClientProvider,
    private readonly documentParserService: DocumentParserService,
  ) {}


  async processFiles(files: Express.Multer.File[]) {
    var dataString: String = '';
    for (let file of files) {
      // TODO implementvalidate files

      // TODO implement choose correct document processor
      dataString += await this.documentParserService.parsePdfFile(file);
    }  
    
    console.log(dataString);
  }

  async saveCvData(data: any) {
    const { data: insertedData, error } =
      await this.supabaseClientProvider.supabase.from('cvs').insert(data);

    if (error) throw new Error(`Failed to save CV data: ${error.message}`);
    return insertedData;
  }
}
