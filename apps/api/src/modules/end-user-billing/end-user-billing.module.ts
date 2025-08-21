import { Module } from '@nestjs/common';
import { EndUserBillingController } from './end-user-billing.controller';
import { EndUserBillingService } from './end-user-billing.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EndUserBillingController],
  providers: [EndUserBillingService],
  exports: [EndUserBillingService],
})
export class EndUserBillingModule {}
