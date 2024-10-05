import { createZodDto } from '@anatine/zod-nestjs';
import { tableNameWithDescriptionSchema } from 'src/supabase/table-name.schema';


export class TableNameDto extends createZodDto(
  tableNameWithDescriptionSchema
) {}
