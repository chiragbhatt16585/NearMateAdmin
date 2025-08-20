import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('api/v1/ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratings: RatingsService) {}

  @Post()
  create(@Body() body: {
    partnerId: string;
    bookingId: string;
    rating: number;
    comment?: string;
  }) {
    return this.ratings.createRating(body);
  }

  @Get('partner/:partnerId')
  getPartnerRatings(
    @Param('partnerId') partnerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ratings.getPartnerRatings(partnerId, pageNum, limitNum);
  }

  @Get('partner/:partnerId/stats')
  getRatingStats(@Param('partnerId') partnerId: string) {
    return this.ratings.getRatingStats(partnerId);
  }

  @Get(':id')
  getRating(@Param('id') id: string) {
    return this.ratings.getRatingById(id);
  }

  @Patch(':id')
  updateRating(
    @Param('id') id: string,
    @Body() body: {
      rating?: number;
      comment?: string;
      status?: string;
    },
  ) {
    return this.ratings.updateRating(id, body);
  }

  @Delete(':id')
  deleteRating(@Param('id') id: string) {
    return this.ratings.deleteRating(id);
  }
}
