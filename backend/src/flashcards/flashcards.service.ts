import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';

@Injectable()
export class FlashcardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFlashcardDto: CreateFlashcardDto, userId: string) {
    return this.prisma.flashcard.create({
      data: {
        ...createFlashcardDto,
        userId,
      },
    });
  }

  async findAllByUser(userId: string, categoryId?: string) {
    return this.prisma.flashcard.findMany({
      where: {
        userId,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
      },
    });
  }

  async findOne(id: string) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!flashcard) {
      throw new NotFoundException(`Fiszka o ID ${id} nie została znaleziona.`);
    }

    return flashcard;
  }

  async update(id: string, updateFlashcardDto: UpdateFlashcardDto) {
    await this.findOne(id);

    return this.prisma.flashcard.update({
      where: { id },
      data: updateFlashcardDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.flashcard.delete({
      where: { id },
    });
  }
}