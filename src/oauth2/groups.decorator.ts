import { SetMetadata, applyDecorators } from '@nestjs/common';

export const Groups = (...groups: string[]) =>
  SetMetadata('requiredGroups', groups);

export const Manager =
  () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const existingMetadata =
      Reflect.getMetadata('swagger/apiOperation', descriptor.value) || {};

    // Append the protection information to the summary
    const updatedSummary = existingMetadata.summary
      ? `${existingMetadata.summary} (Requires Manager privileges)`
      : 'Requires Manager privileges';

    // Define the updated metadata
    const updatedMetadata = {
      ...existingMetadata,
      summary: updatedSummary,
    };

    // Apply the updated metadata
    Reflect.defineMetadata(
      'swagger/apiOperation',
      updatedMetadata,
      descriptor.value,
    );

    // Apply any additional custom metadata
    applyDecorators(SetMetadata('managerRole', true))(
      target,
      propertyKey,
      descriptor,
    );
  };

export const Public =
  () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const existingMetadata =
      Reflect.getMetadata('swagger/apiOperation', descriptor.value) || {};

    // Append the protection information to the summary
    const updatedSummary = existingMetadata.summary
      ? `${existingMetadata.summary} (Public Endpoint)`
      : 'Public Endpoint';

    // Define the updated metadata
    const updatedMetadata = {
      ...existingMetadata,
      summary: updatedSummary,
    };

    // Apply the updated metadata
    Reflect.defineMetadata(
      'swagger/apiOperation',
      updatedMetadata,
      descriptor.value,
    );

    // Apply any additional custom metadata
    applyDecorators(SetMetadata('isPublic', true))(
      target,
      propertyKey,
      descriptor,
    );
  };
