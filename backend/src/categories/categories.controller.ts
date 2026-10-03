import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tworzenie nowej kategorii' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.categoriesService.create(createCategoryDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Pobieranie wszystkich kategorii zalogowanego użytkownika' })
  findAllByUser(@Request() req: any) {
    const userId = req.user.id;
    return this.categoriesService.findAllByUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuwanie kategorii' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.categoriesService.remove(id, req.user.id);
  }
}