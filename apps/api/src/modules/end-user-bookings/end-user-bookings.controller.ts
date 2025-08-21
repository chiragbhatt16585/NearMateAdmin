import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { EndUserBookingsService } from './end-user-bookings.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/end-users/:endUserId/bookings')
export class EndUserBookingsController {
  constructor(private readonly endUserBookingsService: EndUserBookingsService) {}

  @Post()
  create(
    @Param('endUserId') endUserId: string,
    @Body() createBookingDto: {
      partnerId: string;
      categoryId: string;
      serviceDescription?: string;
      scheduledDate?: string;
      scheduledTime?: string;
      priority?: string;
      addressId?: string;
      customAddress?: string;
      lat?: number;
      lng?: number;
      quotedPrice?: number;
    }
  ) {
    return this.endUserBookingsService.create(endUserId, createBookingDto);
  }

  @Get()
  findAll(
    @Param('endUserId') endUserId: string,
    @Query() query: {
      status?: string;
      partnerId?: string;
      categoryId?: string;
      page?: string;
      limit?: string;
    }
  ) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    
    return this.endUserBookingsService.findAll(endUserId, {
      status: query.status,
      partnerId: query.partnerId,
      categoryId: query.categoryId,
      page,
      limit,
    });
  }

  @Get('stats')
  getStats(@Param('endUserId') endUserId: string) {
    return this.endUserBookingsService.getStats(endUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.endUserBookingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateBookingDto: {
      serviceDescription?: string;
      scheduledDate?: string;
      scheduledTime?: string;
      priority?: string;
      status?: string;
      quotedPrice?: number;
      finalPrice?: number;
      paymentStatus?: string;
    }
  ) {
    return this.endUserBookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.endUserBookingsService.remove(id);
  }
}
