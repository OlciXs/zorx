import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';

@ApiTags('flashcards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
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
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filtruj fiszki po ID kategorii lub użyj "uncategorized" dla fiszek bez kategorii' })
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

  @Patch(':id')
  @ApiOperation({ summary: 'Edycja fiszki po ID' })
  @ApiParam({ name: 'id', description: 'ID fiszki' })
  @ApiBody({ type: UpdateFlashcardDto })
  update(@Param('id') id: string, @Body() updateFlashcardDto: UpdateFlashcardDto) {
    return this.flashcardsService.update(id, updateFlashcardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuwanie fiszki po ID' })
  @ApiParam({ name: 'id', description: 'ID fiszki do usunięcia' })
  remove(@Param('id') id: string) {
    return this.flashcardsService.remove(id);
  }
}