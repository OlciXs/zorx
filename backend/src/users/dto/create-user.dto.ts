import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'test@test.pl',
    description: 'Adres e-mail użytkownika',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123abc',
    description: 'Hasło użytkownika (minimum 6 znaków)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}