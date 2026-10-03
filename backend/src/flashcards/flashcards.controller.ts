import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';

@ApiTags('flashcards')
@ApiBearerAuth()
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  @ApiOperation({ summary: 'Tworzenie nowej fiszki dla zalogowanego użytkownika' })
  create(
    @Body() createFlashcardDto: CreateFlashcardDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || req.headers['x-user-id'] || 'test-user-id';
    return this.flashcardsService.create(createFlashcardDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Pobieranie wszystkich fiszek użytkownika (z opcjonalnym filtrowaniem po kategorii)' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filtruj fiszki po ID kategorii' })
  findAll(
    @Request() req: any,
    @Query('categoryId') categoryId?: string,
  ) {
    const userId = req.user?.id || req.headers['x-user-id'] || 'test-user-id';
    return this.flashcardsService.findAllByUser(userId, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobieranie pojedynczej fiszki po ID' })
  @ApiParam({ name: 'id', description: 'ID fiszki' })
  findOne(@Param('id') id: string) {
    return this.flashcardsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuwanie fiszki po ID' })
  @ApiParam({ name: 'id', description: 'ID fiszki do usunięcia' })
  remove(@Param('id') id: string) {
    return this.flashcardsService.remove(id);
  }
}