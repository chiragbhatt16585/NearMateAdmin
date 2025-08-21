import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateLoginIdFromName(fullName: string): Promise<string> {
    const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'X';
    const last = (parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'X')[0] || 'X';
    const prefix = (first + last).toUpperCase();

    const existing = await this.prisma.partner.findMany({
      where: { loginId: { startsWith: prefix } },
      select: { loginId: true },
    });
    let maxNum = 0;
    for (const row of existing) {
      const id = row.loginId || '';
      const numPart = id.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      if (!Number.isNaN(parsed) && parsed > maxNum) maxNum = parsed;
    }
    const nextNum = (maxNum + 1).toString().padStart(6, '0');
    return `${prefix}${nextNum}`;
  }

  async list() {
    return this.prisma.partner.findMany({
      include: {
        categories: { include: { serviceCategory: true } },
        kycs: true,
        bank: true,
        // ratings: {
        //   where: { status: 'active' },
        //   orderBy: { createdAt: 'desc' },
        //   take: 5, // Show last 5 ratings
        // },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: {
    name: string;
    phone?: string;
    email?: string;
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
  }) {
    const createData: any = { name: data.name };
    if (typeof data.phone === 'string' && data.phone.length) createData.phone = data.phone;
    if (typeof data.email === 'string' && data.email.length) createData.email = data.email;
    if (typeof data.serviceRadiusKm === 'number') createData.serviceRadiusKm = data.serviceRadiusKm;
    if (typeof data.isAvailable === 'boolean') createData.isAvailable = data.isAvailable;
    if (typeof data.pricingType === 'string') createData.pricingType = data.pricingType;
    if (typeof data.priceMin === 'number') createData.priceMin = data.priceMin;
    if (typeof data.priceMax === 'number') createData.priceMax = data.priceMax;
    if (typeof data.plan === 'string') createData.plan = data.plan;
    if (typeof data.planStatus === 'string') createData.planStatus = data.planStatus;
    if (typeof data.boostActive === 'boolean') createData.boostActive = data.boostActive;
    if (typeof data.boostStart === 'string' && data.boostStart) createData.boostStart = new Date(data.boostStart);
    if (typeof data.boostEnd === 'string' && data.boostEnd) createData.boostEnd = new Date(data.boostEnd);
    const connectCategories = (data.categoryKeys || []).map((key) => ({ serviceCategory: { connect: { key } } }));
    if (connectCategories.length) {
      createData.categories = { create: connectCategories } as any;
    }
    // For multi-KYC, initial KYC can be created after partner creation via a dedicated endpoint.
    if (data.bank) {
      const b = data.bank;
      const bCreate: any = {};
      if (typeof b.accountName === 'string' && b.accountName.trim().length) bCreate.accountName = b.accountName.trim();
      if (typeof b.accountNo === 'string' && b.accountNo.trim().length) bCreate.accountNo = b.accountNo.trim();
      if (typeof b.ifsc === 'string' && b.ifsc.trim().length) bCreate.ifsc = b.ifsc.trim();
      if (typeof b.bankName === 'string' && b.bankName.trim().length) bCreate.bankName = b.bankName.trim();
      if (Object.keys(bCreate).length) {
        createData.bank = { create: bCreate };
      }
    }
    return (async () => {
      // Generate loginId
      try {
        createData.loginId = await this.generateLoginIdFromName(createData.name);
      } catch {}
      return this.prisma.partner.create({
        data: createData,
        include: { categories: { include: { serviceCategory: true } }, kycs: true, bank: true },
      });
    })();
  }

  async getById(id: string) {
    const row = await this.prisma.partner.findUnique({ 
      where: { id }, 
      include: { 
        categories: { include: { serviceCategory: true } }, 
        kycs: true, 
        bank: true,
        // ratings: {
        //   where: { status: 'active' },
        //   include: {
        //     booking: {
        //       include: {
        //         user: {
        //           select: {
        //             id: true,
        //             name: true,
        //           },
        //         },
        //         category: true,
        //       },
        //     },
        //   },
        //   orderBy: { createdAt: 'desc' },
        // },
      } 
    });
    if (!row) throw new NotFoundException('Partner not found');
    return row;
  }

  async update(
    id: string,
    data: {
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
    const updateData: Prisma.PartnerUpdateInput = {};
    if (typeof data.name === 'string' && data.name.trim().length) updateData.name = data.name.trim();
    if (typeof data.phone === 'string' && data.phone.trim().length) updateData.phone = data.phone.trim();
    if (typeof data.email === 'string' && data.email.trim().length) updateData.email = data.email.trim();
    if (typeof data.serviceRadiusKm === 'number') updateData.serviceRadiusKm = data.serviceRadiusKm;
    if (typeof data.isAvailable === 'boolean') updateData.isAvailable = data.isAvailable;
    if (typeof data.pricingType !== 'undefined') updateData.pricingType = data.pricingType as any;
    if (typeof data.priceMin !== 'undefined') updateData.priceMin = data.priceMin as any;
    if (typeof data.priceMax !== 'undefined') updateData.priceMax = data.priceMax as any;
    if (typeof data.plan !== 'undefined') updateData.plan = data.plan as any;
    if (typeof data.planStatus !== 'undefined') updateData.planStatus = data.planStatus as any;
    if (typeof data.boostActive === 'boolean') updateData.boostActive = data.boostActive;
    if (typeof data.boostStart !== 'undefined') updateData.boostStart = (data.boostStart ? new Date(data.boostStart) : null) as any;
    if (typeof data.boostEnd !== 'undefined') updateData.boostEnd = (data.boostEnd ? new Date(data.boostEnd) : null) as any;
    if (Object.keys(updateData).length) {
      await this.prisma.partner.update({ where: { id }, data: updateData });
    }

    if (Array.isArray(data.categoryKeys)) {
      // Reset categories and recreate
      await this.prisma.partnerCategory.deleteMany({ where: { partnerId: id } });
      if (data.categoryKeys.length) {
        const cats = await this.prisma.serviceCategory.findMany({ where: { key: { in: data.categoryKeys } } });
        if (cats.length) {
          await this.prisma.partnerCategory.createMany({
            data: cats.map((c) => ({ partnerId: id, serviceCategoryId: c.id })),
            skipDuplicates: true,
          });
        }
      }
    }

    // KYC is managed separately via dedicated endpoints for multiple documents

    if (data.bank) {
      const b = data.bank;
      const bUpdate: any = {};
      if (b.accountName === null) bUpdate.accountName = null;
      if (b.accountNo === null) bUpdate.accountNo = null;
      if (b.ifsc === null) bUpdate.ifsc = null;
      if (b.bankName === null) bUpdate.bankName = null;
      if (typeof b.accountName === 'string' && b.accountName.trim().length) bUpdate.accountName = b.accountName.trim();
      if (typeof b.accountNo === 'string' && b.accountNo.trim().length) bUpdate.accountNo = b.accountNo.trim();
      if (typeof b.ifsc === 'string' && b.ifsc.trim().length) bUpdate.ifsc = b.ifsc.trim();
      if (typeof b.bankName === 'string' && b.bankName.trim().length) bUpdate.bankName = b.bankName.trim();
      await this.prisma.partnerBank.upsert({
        where: { partnerId: id },
        create: { partnerId: id, ...bUpdate },
        update: bUpdate,
      });
    }

    // Ensure loginId exists; generate when missing
    const current = await this.prisma.partner.findUnique({ where: { id }, select: { loginId: true, name: true } });
    if (!current?.loginId) {
      try {
        const loginId = await this.generateLoginIdFromName(current?.name || '');
        await this.prisma.partner.update({ where: { id }, data: { loginId } });
      } catch {}
    }

    return this.getById(id);
  }

  remove(id: string) {
    return this.prisma.partner.delete({ where: { id } });
  }

  // KYC management (multiple)
  listKycs(partnerId: string) {
    return this.prisma.partnerKyc.findMany({ where: { partnerId }, orderBy: { createdAt: 'desc' } });
  }

  async createKyc(partnerId: string, data: { idType?: string | null; idNumber?: string | null; status?: string | null; docUrl?: string | null }) {
    const createData: any = { partnerId };
    if (typeof data.idType === 'string' && data.idType.trim().length) createData.idType = data.idType.trim();
    if (typeof data.idNumber === 'string' && data.idNumber.trim().length) createData.idNumber = data.idNumber.trim();
    if (typeof data.status === 'string' && data.status.trim().length) createData.status = data.status.trim();
    if (typeof data.docUrl === 'string' && data.docUrl.trim().length) createData.docUrl = data.docUrl.trim();
    return this.prisma.partnerKyc.create({ data: createData });
  }

  async updateKyc(partnerId: string, kycId: string, data: { idType?: string | null; idNumber?: string | null; status?: string | null; docUrl?: string | null }) {
    const existing = await this.prisma.partnerKyc.findUnique({ where: { id: kycId } });
    if (!existing || existing.partnerId !== partnerId) throw new NotFoundException('KYC not found');
    const updateData: any = {};
    if (data.idType === null) updateData.idType = null;
    if (data.idNumber === null) updateData.idNumber = null;
    if (data.status === null) updateData.status = null;
    if (data.docUrl === null) updateData.docUrl = null;
    if (typeof data.idType === 'string' && data.idType.trim().length) updateData.idType = data.idType.trim();
    if (typeof data.idNumber === 'string' && data.idNumber.trim().length) updateData.idNumber = data.idNumber.trim();
    if (typeof data.status === 'string' && data.status.trim().length) updateData.status = data.status.trim();
    if (typeof data.docUrl === 'string' && data.docUrl.trim().length) updateData.docUrl = data.docUrl.trim();
    return this.prisma.partnerKyc.update({ where: { id: kycId }, data: updateData });
  }

  async deleteKyc(partnerId: string, kycId: string) {
    const existing = await this.prisma.partnerKyc.findUnique({ where: { id: kycId } });
    if (!existing || existing.partnerId !== partnerId) throw new NotFoundException('KYC not found');
    await this.prisma.partnerKyc.delete({ where: { id: kycId } });
    return { ok: true };
  }
}


