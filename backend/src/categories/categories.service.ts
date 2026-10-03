import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

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
    // 1. Sprawdzamy, czy kategoria istnieje i czy na pewno należy do tego użytkownika
    const category = await this.prisma.category.findFirst({
      where: { 
        id: id, 
        userId: userId 
      },
    });

    if (!category) {
      throw new NotFoundException('Kategoria nie została znaleziona lub nie masz do niej dostępu');
    }

    // 2. NAJPIERW usuwamy wszystkie fiszki przypisane do tej kategorii (rozwiązuje błąd bazy danych)
    // Uwaga: Zakładam, że w modelu Prisma fiszka ma pole `categoryId`
    await this.prisma.flashcard.deleteMany({
      where: { 
        categoryId: id 
      },
    });

    // 3. DOPIERO TERAZ bezpiecznie usuwamy samą kategorię
    return this.prisma.category.delete({
      where: { 
        id: id 
      },
    });
  }
}