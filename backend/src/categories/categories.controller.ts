import { Controller, Get, Post, Body, Param, Delete, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tworzenie nowej kategorii' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Tymczasowy ID użytkownika do testów MVP' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: any,
  ) {
    // Pobieramy ID użytkownika z nagłówka lub z sesji/JWT
    const userId = req.headers['x-user-id'] || 'test-user-id';
    return this.categoriesService.create(createCategoryDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Pobieranie wszystkich kategorii danego użytkownika' })
  findAllByUser(@Query('userId') userId: string) {
    return this.categoriesService.findAllByUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuwanie kategorii' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}