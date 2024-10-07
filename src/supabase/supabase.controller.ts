import { Controller, Get, Param, HttpCode, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { tableNameWithDescriptionSchema } from './table-name.schema';
import { SupabaseService } from './supabase.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TableNameDto } from './dto/table-name.dto';

@ApiTags('Supabase ')
@Controller()
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('fetch-profiles')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch profiles data' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched data',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              profile_pic: { type: 'string' },
              social_media_links: { type: 'string' },
              user_id: { type: 'string', format: 'uuid' },
              metadata: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async fetchProfiles() {
    const data = await this.supabaseService.getProfilesData();
    console.log(data);
    return { data };
  }

  @Get('fetch-table/:table_name')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch table name' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched table name',
    schema: {
      type: 'object',
      properties: {
        table_name: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, Invalid table name',
  })
  @UsePipes(new ZodValidationPipe(tableNameWithDescriptionSchema))
  async fetchTable(@Param() params: TableNameDto) {
    const data = await this.supabaseService.getTableData(params.table_name);
    console.log(data);
    return { table_name: params.table_name, data };
  }
}
