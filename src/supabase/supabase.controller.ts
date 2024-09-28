import { Controller, Get, Param, HttpCode } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { tableNameSchema, ValidTableName } from './table-name.schema';
import { UsePipes } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; 	

@ApiTags('Supabase ')
@Controller()
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('fetch-profiles')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch profiles data' })
  @ApiResponse({status: 200, description: 'Successfully fetched data'})
  async fetchProfiles() {
    const data = await this.supabaseService.getProfilesData();
    console.log(data);
    return { data };
  }

  @Get('fetch-table/:table_name')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch table name' })
  @ApiResponse({status: 200, description: 'Successfully fetched table name'})
  @UsePipes(new ZodValidationPipe(tableNameSchema))
  async fetchTable(@Param('table_name') table_name: ValidTableName) {
    const data = await this.supabaseService.getTableData(table_name);
    console.log(data);
    return { table_name, data };
  }
}
