import { z } from 'zod';

export const tableNameSchema = z.enum([
  'certifications',
  'cvs',
  'keywords',
  'managers',
  'profiles',
  'project_categories',
  'project_keywords',
  'projects',
  'skills',
]);

export type ValidTableName = z.infer<typeof tableNameSchema>;
