import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';

@ApiTags('flashcards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // <-- Zabezpieczenie JWT dla całego kontrolera
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  @ApiOperation({ summary: 'Tworzenie nowej fiszki dla zalogowanego użytkownika' })
  create(
    @Body() createFlashcardDto: CreateFlashcardDto,
    @Request() req: any,
  ) {
    return this.flashcardsService.create(createFlashcardDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Pobieranie wszystkich fiszek użytkownika' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filtruj fiszki po ID kategorii' })
  findAll(
    @Request() req: any,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.flashcardsService.findAllByUser(req.user.id, categoryId);
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