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
        userId, // Przekazujemy userId jawnie do relacji w Prismie
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Kategoria o ID ${id} nie istnieje.`);
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}