import { Module } from '@nestjs/common';
import { PublicApiController } from './public-api.controller';
import { CategoriesModule } from '../categories/categories.module';
import { PincodeModule } from '../pincode/pincode.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [CategoriesModule, PincodeModule, ApiKeysModule],
  controllers: [PublicApiController],
})
export class PublicApiModule {}
