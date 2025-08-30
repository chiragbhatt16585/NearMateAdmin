import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { CategoriesModule } from './categories/categories.module';
import { PartnersModule } from './partners/partners.module';
import { EndUsersModule } from './end-users/end-users.module';
import { EndUserAddressesModule } from './end-user-addresses/end-user-addresses.module';
import { EndUserBookingsModule } from './end-user-bookings/end-user-bookings.module';
import { EndUserBillingModule } from './end-user-billing/end-user-billing.module';
import { PincodeModule } from './pincode/pincode.module';
// import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    CategoriesModule,
    PartnersModule,
    EndUsersModule,
    EndUserAddressesModule,
    EndUserBookingsModule,
    EndUserBillingModule,
    PincodeModule,
    // RatingsModule,
  ],
})
export class AppModule {}


