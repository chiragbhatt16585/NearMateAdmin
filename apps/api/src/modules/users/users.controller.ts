import { Body, Controller, Delete, Get, Param, Post, Query, Patch, UseGuards, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.users.list({ search });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.users.findById(id);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  @Post()
  async create(
    @Body() body: { email: string; name: string; password: string; role: string },
  ) {
    const email = body?.email?.trim();
    const name = body?.name?.trim();
    const password = body?.password?.trim();
    const role = body?.role?.trim();
    if (!email || !name || !password || !role) throw new BadRequestException('email, name, password, role are required');
    try {
      return await this.users.create({ email, name, password, role });
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Email already exists');
      throw e;
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; role?: string; status?: string; password?: string | null },
  ) {
    return this.users.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(id);
  }
}


