import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.users.findById(id);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}


