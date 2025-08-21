import { Module } from '@nestjs/common';
import { EndUsersController } from './end-users.controller';
import { EndUsersService } from './end-users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EndUsersController],
  providers: [EndUsersService],
  exports: [EndUsersService],
})
export class EndUsersModule {}
