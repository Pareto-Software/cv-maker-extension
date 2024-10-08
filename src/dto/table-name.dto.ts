import { createZodDto } from '@anatine/zod-nestjs';
import { tableNameWithDescriptionSchema } from '../supabase/table-name.schema';


export class TableNameDto extends createZodDto(
  tableNameWithDescriptionSchema
) {}
