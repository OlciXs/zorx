import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'test@test.pl',
    description: 'Adres e-mail',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123abc',
    description: 'Hasło',
  })
  @IsString()
  password!: string;
}