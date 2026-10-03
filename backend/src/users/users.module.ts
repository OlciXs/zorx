import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtStrategy } from './jwt.strategy'; // Stworzymy ten plik za chwilę

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_tajny_klucz_jwt', // Zalecane w .env
      signOptions: { expiresIn: '7d' }, // Token ważny 7 dni
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  exports: [UsersService, JwtModule, PassportModule],
})
export class UsersModule {}