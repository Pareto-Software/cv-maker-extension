import { ApiProperty } from '@nestjs/swagger';

// Added this as an example of how description can be added
// If you know that there are more limits for the properties(e.g. string with a max length of 5)
// use the extra properties to define those if possible
export class ExampleResponseDTO {
  @ApiProperty({
    description: 'Name of the example response',
    maxLength: 3,
  })
  name: string;
}
