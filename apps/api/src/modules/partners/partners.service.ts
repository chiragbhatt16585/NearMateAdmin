import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  list(params?: { search?: string }) {
    const where: Prisma.PartnerWhereInput | undefined = params?.search
      ? {
          OR: [
            { name: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;
    return this.prisma.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { categories: { include: { serviceCategory: true } } },
    });
  }

  create(data: { name: string; phone?: string; email?: string; categoryKeys?: string[] }) {
    const createData: any = { name: data.name };
    if (typeof data.phone === 'string' && data.phone.length) createData.phone = data.phone;
    if (typeof data.email === 'string' && data.email.length) createData.email = data.email;
    const connectCategories = (data.categoryKeys || []).map((key) => ({ serviceCategory: { connect: { key } } }));
    if (connectCategories.length) {
      createData.categories = { create: connectCategories } as any;
    }
    return this.prisma.partner.create({
      data: createData,
      include: { categories: { include: { serviceCategory: true } } },
    });
  }

  async getById(id: string) {
    const row = await this.prisma.partner.findUnique({ where: { id }, include: { categories: { include: { serviceCategory: true } } } });
    if (!row) throw new NotFoundException('Partner not found');
    return row;
  }

  async update(
    id: string,
    data: { name?: string; phone?: string | null; email?: string | null; categoryKeys?: string[] },
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

    return this.getById(id);
  }

  remove(id: string) {
    return this.prisma.partner.delete({ where: { id } });
  }
}


