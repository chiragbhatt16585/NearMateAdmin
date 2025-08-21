import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  BadRequestException 
} from '@nestjs/common';
import { EndUsersService } from './end-users.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/end-users')
export class EndUsersController {
  constructor(private readonly endUsersService: EndUsersService) {}

  @Post()
  create(@Body() createEndUserDto: {
    email: string;
    phone: string;
    name: string;
    dateOfBirth?: string;
    gender?: string;
  }) {
    const data = {
      ...createEndUserDto,
      dateOfBirth: createEndUserDto.dateOfBirth ? new Date(createEndUserDto.dateOfBirth) : undefined,
    };
    
    return this.endUsersService.create(data);
  }

  @Get()
  findAll(@Query() query: {
    search?: string;
    status?: string;
    page?: string;
    limit?: string;
  }) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    
    return this.endUsersService.findAll({
      search: query.search,
      status: query.status,
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.endUsersService.findOne(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.endUsersService.getStats(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateEndUserDto: {
      name?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      gender?: string;
      status?: string;
    }
  ) {
    const data = {
      ...updateEndUserDto,
      dateOfBirth: updateEndUserDto.dateOfBirth ? new Date(updateEndUserDto.dateOfBirth) : undefined,
    };
    
    return this.endUsersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.endUsersService.remove(id);
  }
}
