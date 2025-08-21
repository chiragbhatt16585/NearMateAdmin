import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { EndUserBillingService } from './end-user-billing.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/end-users/:endUserId/billing')
export class EndUserBillingController {
  constructor(private readonly endUserBillingService: EndUserBillingService) {}

  @Post()
  create(
    @Param('endUserId') endUserId: string,
    @Body() createBillingDto: {
      bookingId: string;
      amount: number;
      currency?: string;
      taxAmount?: number;
      discountAmount?: number;
      paymentMethod?: string;
      invoiceNumber?: string;
      dueDate?: string;
    }
  ) {
    return this.endUserBillingService.create(endUserId, createBillingDto);
  }

  @Get()
  findAll(
    @Param('endUserId') endUserId: string,
    @Query() query: {
      paymentStatus?: string;
      paymentMethod?: string;
      page?: string;
      limit?: string;
    }
  ) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    
    return this.endUserBillingService.findAll(endUserId, {
      paymentStatus: query.paymentStatus,
      paymentMethod: query.paymentMethod,
      page,
      limit,
    });
  }

  @Get('stats')
  getStats(@Param('endUserId') endUserId: string) {
    return this.endUserBillingService.getStats(endUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.endUserBillingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateBillingDto: {
      amount?: number;
      taxAmount?: number;
      discountAmount?: number;
      paymentMethod?: string;
      paymentStatus?: string;
      transactionId?: string;
      paidAt?: string;
      invoiceNumber?: string;
      dueDate?: string;
    }
  ) {
    return this.endUserBillingService.update(id, updateBillingDto);
  }

  @Patch(':id/mark-paid')
  markAsPaid(
    @Param('id') id: string,
    @Body() markPaidDto: {
      paymentMethod: string;
      transactionId?: string;
    }
  ) {
    return this.endUserBillingService.markAsPaid(id, markPaidDto);
  }
}
