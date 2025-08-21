import { Module } from '@nestjs/common';
import { EndUserAddressesController } from './end-user-addresses.controller';
import { EndUserAddressesService } from './end-user-addresses.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EndUserAddressesController],
  providers: [EndUserAddressesService],
  exports: [EndUserAddressesService],
})
export class EndUserAddressesModule {}
