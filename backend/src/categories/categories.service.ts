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
        userId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { 
        id: id, 
        userId: userId 
      },
    });

    if (!category) {
      throw new NotFoundException('Kategoria nie została znaleziona lub nie masz do niej dostępu');
    }

    await this.prisma.flashcard.deleteMany({
      where: { 
        categoryId: id 
      },
    });

    return this.prisma.category.delete({
      where: { 
        id: id 
      },
    });
  }
}