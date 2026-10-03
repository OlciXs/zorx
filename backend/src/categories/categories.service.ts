import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

// src/categories/categories.service.ts
async create(createCategoryDto: CreateCategoryDto, userId: string) {
  return this.prisma.category.create({
    data: {
      ...createCategoryDto,
      userId, // Przypisanie do konkretnego użytkownika
    },
  });
}

async findAllByUser(userId: string) {
  return this.prisma.category.findMany({
    where: { userId }, // Pobieranie tylko kategorii tego użytkownika
  });
}

async remove(id: string, userId: string) {
  return this.prisma.category.deleteMany({
    where: {
      id: id,
      userId: userId, // Dopisujemy userId, żeby użytkownik nie mógł usunąć cudzej kategorii
    },
  });
}
}