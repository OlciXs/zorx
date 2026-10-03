import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UsersModule } from '../users/users.module'; // <-- Import

@Module({
  imports: [UsersModule], // <-- Dodaj do imports!
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}