import { Module } from '@nestjs/common';
import { EndUserBookingsController } from './end-user-bookings.controller';
import { EndUserBookingsService } from './end-user-bookings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EndUserBookingsController],
  providers: [EndUserBookingsService],
  exports: [EndUserBookingsService],
})
export class EndUserBookingsModule {}
