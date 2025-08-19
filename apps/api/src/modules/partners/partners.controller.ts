import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, BadRequestException, ConflictException } from '@nestjs/common';
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
  async create(
    @Body()
    body: {
      name: string;
      phone?: string;
      email?: string;
      categoryKeys?: string[];
      kyc?: { idType?: string | null; idNumber?: string | null; status?: string | null };
      bank?: { accountName?: string | null; accountNo?: string | null; ifsc?: string | null; bankName?: string | null };
    },
  ) {
    const name = body?.name?.trim();
    if (!name) throw new BadRequestException('Name is required');
    const phone = body?.phone?.trim() || undefined;
    const email = body?.email?.trim() || undefined;
    const categoryKeys = Array.isArray(body?.categoryKeys) ? body.categoryKeys : [];
    const kyc = typeof body?.kyc === 'object' && body.kyc ? body.kyc : undefined;
    const bank = typeof body?.bank === 'object' && body.bank ? body.bank : undefined;
    try {
      return await this.partners.create({ name, phone, email, categoryKeys, kyc, bank });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Email or phone already exists');
      }
      throw e;
    }
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.partners.getById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      phone?: string | null;
      email?: string | null;
      categoryKeys?: string[];
      kyc?: { idType?: string | null; idNumber?: string | null; status?: string | null };
      bank?: { accountName?: string | null; accountNo?: string | null; ifsc?: string | null; bankName?: string | null };
    },
  ) {
    const data: {
      name?: string;
      phone?: string | null;
      email?: string | null;
      categoryKeys?: string[];
      kyc?: { idType?: string | null; idNumber?: string | null; status?: string | null };
      bank?: { accountName?: string | null; accountNo?: string | null; ifsc?: string | null; bankName?: string | null };
    } = {};
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
    if (typeof body?.kyc === 'object') data.kyc = body.kyc as any;
    if (typeof body?.bank === 'object') data.bank = body.bank as any;
    try {
      return await this.partners.update(id, data);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Email or phone already exists');
      }
      throw e;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partners.remove(id);
  }
}


