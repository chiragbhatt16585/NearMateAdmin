import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, BadRequestException, ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.list();
  }

  @Post()
  create(@Body() body: { key: string; label: string; icon?: string; tone?: string; popular?: boolean }) {
    const key = body?.key?.trim();
    const label = body?.label?.trim();
    if (!key) throw new BadRequestException('Key is required');
    if (!label) throw new BadRequestException('Label is required');
    const icon = body?.icon?.trim() || undefined;
    const tone = body?.tone?.trim() || undefined;
    const popular = typeof body?.popular === 'boolean' ? body.popular : false;
    try {
      return this.categories.create({ key, label, icon, tone, popular });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Category key or label already exists');
      }
      throw e;
    }
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.categories.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { key?: string; label?: string; icon?: string; tone?: string; popular?: boolean }) {
    const data: { key?: string; label?: string; icon?: string; tone?: string; popular?: boolean } = {};
    if (typeof body?.key === 'string') {
      const v = body.key.trim();
      if (!v) throw new BadRequestException('Key cannot be empty');
      data.key = v;
    }
    if (typeof body?.label === 'string') {
      const v = body.label.trim();
      if (!v) throw new BadRequestException('Label cannot be empty');
      data.label = v;
    }
    if (typeof body?.icon === 'string') {
      const v = body.icon.trim();
      data.icon = v.length ? v : undefined;
    }
    if (typeof body?.tone === 'string') {
      const v = body.tone.trim();
      data.tone = v.length ? v : undefined;
    }
    if (typeof body?.popular === 'boolean') {
      data.popular = body.popular;
    }
    try {
      return this.categories.update(id, data);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Category key or label already exists');
      }
      throw e;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categories.remove(id);
  }
}


