import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, BadRequestException, ConflictException } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/partners')
export class PartnersController {
  constructor(private readonly partners: PartnersService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.partners.list();
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      phone?: string;
      email?: string;
      categoryKeys?: string[];
      // KYC will be handled via dedicated endpoints for multiple docs
      bank?: { accountName?: string | null; accountNo?: string | null; ifsc?: string | null; bankName?: string | null };
      serviceRadiusKm?: number;
      isAvailable?: boolean;
      pricingType?: string | null;
      priceMin?: number | null;
      priceMax?: number | null;
      plan?: string | null;
      planStatus?: string | null;
      boostActive?: boolean;
      boostStart?: string | null; // ISO date
      boostEnd?: string | null;   // ISO date
    },
  ) {
    const name = body?.name?.trim();
    if (!name) throw new BadRequestException('Name is required');
    const phone = body?.phone?.trim() || undefined;
    const email = body?.email?.trim() || undefined;
    const categoryKeys = Array.isArray(body?.categoryKeys) ? body.categoryKeys : [];
    const bank = typeof body?.bank === 'object' && body.bank ? body.bank : undefined;
    try {
      return await this.partners.create({
        name,
        phone,
        email,
        categoryKeys,
        bank,
        serviceRadiusKm: typeof body?.serviceRadiusKm === 'number' ? body.serviceRadiusKm : undefined,
        isAvailable: typeof body?.isAvailable === 'boolean' ? body.isAvailable : undefined,
        pricingType: typeof body?.pricingType === 'string' ? body.pricingType : undefined,
        priceMin: typeof body?.priceMin === 'number' ? body.priceMin : undefined,
        priceMax: typeof body?.priceMax === 'number' ? body.priceMax : undefined,
        plan: typeof body?.plan === 'string' ? body.plan : undefined,
        planStatus: typeof body?.planStatus === 'string' ? body.planStatus : undefined,
        boostActive: typeof body?.boostActive === 'boolean' ? body.boostActive : undefined,
        boostStart: typeof body?.boostStart === 'string' && body.boostStart ? body.boostStart : undefined,
        boostEnd: typeof body?.boostEnd === 'string' && body.boostEnd ? body.boostEnd : undefined,
      });
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
      bank?: { accountName?: string | null; accountNo?: string | null; ifsc?: string | null; bankName?: string | null };
      serviceRadiusKm?: number;
      isAvailable?: boolean;
      pricingType?: string | null;
      priceMin?: number | null;
      priceMax?: number | null;
      plan?: string | null;
      planStatus?: string | null;
      boostActive?: boolean;
      boostStart?: string | null;
      boostEnd?: string | null;
    },
  ) {
    const data: {
      name?: string;
      phone?: string | null;
      email?: string | null;
      categoryKeys?: string[];
      bank?: { accountName?: string | null; accountNo?: string | null; ifsc?: string | null; bankName?: string | null };
      serviceRadiusKm?: number;
      isAvailable?: boolean;
      pricingType?: string | null;
      priceMin?: number | null;
      priceMax?: number | null;
      plan?: string | null;
      planStatus?: string | null;
      boostActive?: boolean;
      boostStart?: string | null;
      boostEnd?: string | null;
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
    // KYC changes are managed via dedicated endpoints
    if (typeof body?.bank === 'object') data.bank = body.bank as any;
    if (typeof body?.serviceRadiusKm === 'number') data.serviceRadiusKm = body.serviceRadiusKm;
    if (typeof body?.isAvailable === 'boolean') data.isAvailable = body.isAvailable;
    if (typeof body?.pricingType !== 'undefined') data.pricingType = body.pricingType as any;
    if (typeof body?.priceMin !== 'undefined') data.priceMin = body.priceMin as any;
    if (typeof body?.priceMax !== 'undefined') data.priceMax = body.priceMax as any;
    if (typeof body?.plan !== 'undefined') data.plan = body.plan as any;
    if (typeof body?.planStatus !== 'undefined') data.planStatus = body.planStatus as any;
    if (typeof body?.boostActive === 'boolean') data.boostActive = body.boostActive;
    if (typeof body?.boostStart !== 'undefined') data.boostStart = body.boostStart as any;
    if (typeof body?.boostEnd !== 'undefined') data.boostEnd = body.boostEnd as any;
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

  // KYC endpoints
  @Get(':id/kyc')
  listKycs(@Param('id') id: string) {
    return this.partners.listKycs(id);
  }

  @Post(':id/kyc')
  createKyc(
    @Param('id') id: string,
    @Body() body: { idType?: string | null; idNumber?: string | null; status?: string | null; docUrl?: string | null },
  ) {
    return this.partners.createKyc(id, body);
  }

  @Patch(':id/kyc/:kycId')
  updateKyc(
    @Param('id') id: string,
    @Param('kycId') kycId: string,
    @Body() body: { idType?: string | null; idNumber?: string | null; status?: string | null; docUrl?: string | null },
  ) {
    return this.partners.updateKyc(id, kycId, body);
  }

  @Delete(':id/kyc/:kycId')
  deleteKyc(@Param('id') id: string, @Param('kycId') kycId: string) {
    return this.partners.deleteKyc(id, kycId);
  }
}


