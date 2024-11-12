import { SetMetadata } from '@nestjs/common';

export const Groups = (...groups: string[]) =>
  SetMetadata('requiredGroups', groups);

export const Manager = () => SetMetadata('managerRole', true);

export const Public = () => SetMetadata('isPublic', true);
