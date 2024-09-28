import { Controller, Get, Param, HttpCode } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { tableNameSchema, ValidTableName } from './table-name.schema';
import { UsePipes } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Controller()
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('fetch-profiles')
  @HttpCode(200)
  async fetchProfiles() {
    const data = await this.supabaseService.getProfilesData();
    console.log(data);
    return { data };
  }

  @Get('fetch-table/:table_name')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(tableNameSchema))
  async fetchTable(@Param('table_name') table_name: ValidTableName) {
    const data = await this.supabaseService.getTableData(table_name);
    console.log(data);
    return { table_name, data };
  }
}
