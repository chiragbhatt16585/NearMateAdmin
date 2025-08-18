import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.items.list({ search, skip: skip ? Number(skip) : 0, take: take ? Number(take) : 20 });
  }

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.items.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.items.getById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; status?: string },
  ) {
    return this.items.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.items.remove(id);
  }
}


