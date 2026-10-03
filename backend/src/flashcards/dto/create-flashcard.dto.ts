import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateFlashcardDto {
  @ApiProperty({
    example: 'resilient',
    description: 'Słowo lub zwrot do nauki',
  })
  @IsString()
  @IsNotEmpty()
  word!: string;

  @ApiProperty({
    example: 'odporny, elastyczny',
    description: 'Tłumaczenie słowa',
  })
  @IsString()
  @IsNotEmpty()
  translation!: string;

  @ApiPropertyOptional({
    example: 'Able to withstand or recover quickly from difficult conditions.',
    description: 'Definicja (opcjonalnie wygenerowana przez AI)',
  })
  @IsString()
  @IsOptional()
  definition?: string;

  @ApiPropertyOptional({
    example: ['tough', 'adaptable', 'buoyant'],
    description: 'Lista synonimów',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  synonyms?: string[];

  @ApiPropertyOptional({
    example: 'cat_uuid_123',
    description: 'ID wybranej kategorii (opcjonalnie)',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;
}