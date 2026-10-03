import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Angielski - Biznes',
    description: 'Nazwa nowej kategorii',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}