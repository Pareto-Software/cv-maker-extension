import { createZodDto } from '@anatine/zod-nestjs';
import { tableNameWithDescriptionSchema } from '../table-name.schema';

export class TableNameDto extends createZodDto(
  tableNameWithDescriptionSchema,
) {}
