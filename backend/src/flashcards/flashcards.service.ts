import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';

@Injectable()
export class FlashcardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFlashcardDto: CreateFlashcardDto, userId: string) {
    let user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await this.prisma.user.findFirst();
      if (!user) {
        throw new NotFoundException('Brak użytkowników w bazie. Zarejestruj najpierw użytkownika.');
      }
    }

    return this.prisma.flashcard.create({
      data: {
        ...createFlashcardDto,
        userId: user.id,
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

  async remove(id: string) {
    await this.findOne(id); // Rzuca NotFoundException jeśli fiszka nie istnieje

    return this.prisma.flashcard.delete({
      where: { id },
    });
  }
}