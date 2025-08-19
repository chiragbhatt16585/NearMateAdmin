import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/partners')
export class PartnersController {
  constructor(private readonly partners: PartnersService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.partners.list({ search });
  }

  @Post()
  create(
    @Body()
    body: { name: string; phone?: string; email?: string; categoryKeys?: string[] },
  ) {
    const name = body?.name?.trim();
    if (!name) throw new BadRequestException('Name is required');
    const phone = body?.phone?.trim() || undefined;
    const email = body?.email?.trim() || undefined;
    const categoryKeys = Array.isArray(body?.categoryKeys) ? body.categoryKeys : [];
    return this.partners.create({ name, phone, email, categoryKeys });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.partners.getById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; phone?: string | null; email?: string | null; categoryKeys?: string[] },
  ) {
    const data: { name?: string; phone?: string | null; email?: string | null; categoryKeys?: string[] } = {};
    if (typeof body?.name === 'string') {
      const v = body.name.trim();
      if (!v) throw new BadRequestException('Name cannot be empty');
      data.name = v;
    }
    if (typeof body?.phone === 'string') data.phone = body.phone.trim();
    if (body?.phone === null) data.phone = null;
    if (typeof body?.email === 'string') data.email = body.email.trim();
    if (body?.email === null) data.email = null;
    if (Array.isArray(body?.categoryKeys)) data.categoryKeys = body.categoryKeys;
    return this.partners.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partners.remove(id);
  }
}


