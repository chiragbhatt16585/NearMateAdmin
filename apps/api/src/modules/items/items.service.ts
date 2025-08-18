import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  list(params: { search?: string; skip?: number; take?: number }) {
    const { search, skip = 0, take = 20 } = params;
    return this.prisma.item.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  create(data: { name: string; description?: string }) {
    return this.prisma.item.create({ data });
  }

  async getById(id: string) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  update(id: string, data: { name?: string; description?: string; status?: string }) {
    return this.prisma.item.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.item.delete({ where: { id } });
  }
}


