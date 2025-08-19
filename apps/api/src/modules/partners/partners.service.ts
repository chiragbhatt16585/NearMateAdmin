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

  list(params?: { search?: string }) {
    const where: Prisma.PartnerWhereInput | undefined = params?.search
      ? {
          OR: [
            { name: { contains: params.search } },
            { email: { contains: params.search } },
            { phone: { contains: params.search } },
          ],
        }
      : undefined;
    return this.prisma.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { categories: { include: { serviceCategory: true } }, kyc: true, bank: true },
    });
  }

  create(data: {
    name: string;
    phone?: string;
    email?: string;
    categoryKeys?: string[];
    kyc?: { idType?: string | null; idNumber?: string | null; status?: string | null };
    bank?: { accountName?: string | null; accountNo?: string | null; ifsc?: string | null; bankName?: string | null };
  }) {
    const createData: any = { name: data.name };
    if (typeof data.phone === 'string' && data.phone.length) createData.phone = data.phone;
    if (typeof data.email === 'string' && data.email.length) createData.email = data.email;
    const connectCategories = (data.categoryKeys || []).map((key) => ({ serviceCategory: { connect: { key } } }));
    if (connectCategories.length) {
      createData.categories = { create: connectCategories } as any;
    }
    if (data.kyc) {
      const k = data.kyc;
      const kCreate: any = {};
      if (typeof k.idType === 'string' && k.idType.trim().length) kCreate.idType = k.idType.trim();
      if (typeof k.idNumber === 'string' && k.idNumber.trim().length) kCreate.idNumber = k.idNumber.trim();
      if (typeof k.status === 'string' && k.status.trim().length) kCreate.status = k.status.trim();
      if (Object.keys(kCreate).length) {
        createData.kyc = { create: kCreate };
      }
    }
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
        include: { categories: { include: { serviceCategory: true } }, kyc: true, bank: true },
      });
    })();
  }

  async getById(id: string) {
    const row = await this.prisma.partner.findUnique({ where: { id }, include: { categories: { include: { serviceCategory: true } }, kyc: true, bank: true } });
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
      kyc?: { idType?: string | null; idNumber?: string | null; status?: string | null };
      bank?: { accountName?: string | null; accountNo?: string | null; ifsc?: string | null; bankName?: string | null };
    },
  ) {
    const updateData: Prisma.PartnerUpdateInput = {};
    if (typeof data.name === 'string' && data.name.trim().length) updateData.name = data.name.trim();
    if (typeof data.phone === 'string' && data.phone.trim().length) updateData.phone = data.phone.trim();
    if (typeof data.email === 'string' && data.email.trim().length) updateData.email = data.email.trim();
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

    if (data.kyc) {
      const k = data.kyc;
      const kUpdate: any = {};
      if (k.idType === null) kUpdate.idType = null;
      if (k.idNumber === null) kUpdate.idNumber = null;
      if (k.status === null) kUpdate.status = null;
      if (typeof k.idType === 'string' && k.idType.trim().length) kUpdate.idType = k.idType.trim();
      if (typeof k.idNumber === 'string' && k.idNumber.trim().length) kUpdate.idNumber = k.idNumber.trim();
      if (typeof k.status === 'string' && k.status.trim().length) kUpdate.status = k.status.trim();
      await this.prisma.partnerKyc.upsert({
        where: { partnerId: id },
        create: { partnerId: id, ...kUpdate },
        update: kUpdate,
      });
    }

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
}


