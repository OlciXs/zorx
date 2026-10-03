import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // LUB Twój customowy JwtAuthGuard
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // <-- Zabezpiecza cały kontroler tokenem JWT
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tworzenie nowej kategorii' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: any,
  ) {
    // ID użytkownika wyciągamy bezpiecznie z rozszyfrowanego tokena JWT
    const userId = req.user.id;
    return this.categoriesService.create(createCategoryDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Pobieranie wszystkich kategorii zalogowanego użytkownika' })
  findAllByUser(@Request() req: any) {
    // Nie potrzebujemy już @Query('userId') – pobieramy id z tokena
    const userId = req.user.id;
    return this.categoriesService.findAllByUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuwanie kategorii' })
  remove(@Param('id') id: string, @Request() req: any) {
    // Opcjonalnie możesz przekazać req.user.id do serwisu, aby upewnić się, 
    // że użytkownik usuwa SWOJĄ kategorię, a nie cudzą
    return this.categoriesService.remove(id, req.user.id);
  }
}