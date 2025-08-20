import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async list(params?: { search?: string }) {
    const where = params?.search
      ? {
          OR: [
            { name: { contains: params.search } },
            { email: { contains: params.search } },
            { role: { contains: params.search } },
          ],
        }
      : undefined;
    return this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(data: { email: string; name: string; password: string; role: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { email: data.email.trim(), name: data.name.trim(), hashedPassword, role: data.role.trim() },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });
  }

  async update(
    id: string,
    data: { name?: string; role?: string; status?: string; password?: string | null },
  ) {
    const updateData: any = {};
    if (typeof data.name === 'string' && data.name.trim().length) updateData.name = data.name.trim();
    if (typeof data.role === 'string' && data.role.trim().length) updateData.role = data.role.trim();
    if (typeof data.status === 'string' && data.status.trim().length) updateData.status = data.status.trim();
    if (data.password === null) {
      // no op; we do not support nulling password
    } else if (typeof data.password === 'string' && data.password.trim().length) {
      updateData.hashedPassword = await bcrypt.hash(data.password.trim(), 10);
    }
    await this.prisma.user.update({ where: { id }, data: updateData });
    return this.findById(id);
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}


