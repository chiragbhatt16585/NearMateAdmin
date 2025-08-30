import { Module } from '@nestjs/common';
import { PincodeController } from './pincode.controller';
import { PincodeService } from './pincode.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PincodeController],
  providers: [PincodeService],
  exports: [PincodeService],
})
export class PincodeModule {}
