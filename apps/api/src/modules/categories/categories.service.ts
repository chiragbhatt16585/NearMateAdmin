import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.serviceCategory.findMany({ orderBy: { label: 'asc' } });
  }

  create(data: { key: string; label: string; icon?: string; tone?: string; popular?: boolean }) {
    return this.prisma.serviceCategory.create({ data });
  }

  async getById(id: string) {
    const row = await this.prisma.serviceCategory.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }

  update(id: string, data: { key?: string; label?: string; icon?: string; tone?: string; popular?: boolean }) {
    return this.prisma.serviceCategory.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.serviceCategory.delete({ where: { id } });
  }
}


