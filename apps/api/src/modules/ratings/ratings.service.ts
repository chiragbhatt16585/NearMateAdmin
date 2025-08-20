import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async createRating(data: {
    partnerId: string;
    bookingId: string;
    rating: number;
    comment?: string;
  }) {
    // Validate rating range
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if partner exists
    const partner = await this.prisma.partner.findUnique({
      where: { id: data.partnerId },
    });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Check if booking exists and is completed
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if rating already exists for this booking
    const existingRating = await this.prisma.partnerRating.findUnique({
      where: { bookingId: data.bookingId },
    });
    if (existingRating) {
      throw new BadRequestException('Rating already exists for this booking');
    }

    // Create the rating
    const rating = await this.prisma.partnerRating.create({
      data: {
        partnerId: data.partnerId,
        bookingId: data.bookingId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        partner: true,
        booking: true,
      },
    });

    // Update partner's average rating
    await this.updatePartnerRatingStats(data.partnerId);

    return rating;
  }

  async updateRating(
    ratingId: string,
    data: {
      rating?: number;
      comment?: string;
      status?: string;
    },
  ) {
    // Validate rating range if provided
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const rating = await this.prisma.partnerRating.findUnique({
      where: { id: ratingId },
    });
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    const updatedRating = await this.prisma.partnerRating.update({
      where: { id: ratingId },
      data: {
        rating: data.rating,
        comment: data.comment,
        status: data.status,
      },
      include: {
        partner: true,
        booking: true,
      },
    });

    // Update partner's average rating if rating changed
    if (data.rating !== undefined) {
      await this.updatePartnerRatingStats(rating.partnerId);
    }

    return updatedRating;
  }

  async deleteRating(ratingId: string) {
    const rating = await this.prisma.partnerRating.findUnique({
      where: { id: ratingId },
    });
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    await this.prisma.partnerRating.delete({
      where: { id: ratingId },
    });

    // Update partner's average rating
    await this.updatePartnerRatingStats(rating.partnerId);

    return { message: 'Rating deleted successfully' };
  }

  async getPartnerRatings(partnerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      this.prisma.partnerRating.findMany({
        where: { 
          partnerId,
          status: 'active'
        },
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.partnerRating.count({
        where: { 
          partnerId,
          status: 'active'
        },
      }),
    ]);

    return {
      ratings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getRatingById(ratingId: string) {
    const rating = await this.prisma.partnerRating.findUnique({
      where: { id: ratingId },
      include: {
        partner: true,
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            category: true,
          },
        },
      },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    return rating;
  }

  private async updatePartnerRatingStats(partnerId: string) {
    const stats = await this.prisma.partnerRating.aggregate({
      where: {
        partnerId,
        status: 'active',
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const ratingAvg = stats._avg.rating || 0;
    const ratingCount = stats._count.rating || 0;

    await this.prisma.partner.update({
      where: { id: partnerId },
      data: {
        ratingAvg,
        ratingCount,
      },
    });
  }

  async getRatingStats(partnerId: string) {
    const stats = await this.prisma.partnerRating.groupBy({
      by: ['rating'],
      where: {
        partnerId,
        status: 'active',
      },
      _count: {
        rating: true,
      },
    });

    const ratingDistribution = stats.reduce((acc, stat) => {
      acc[stat.rating] = stat._count.rating;
      return acc;
    }, {} as Record<number, number>);

    // Fill in missing ratings with 0
    for (let i = 1; i <= 5; i++) {
      if (!ratingDistribution[i]) {
        ratingDistribution[i] = 0;
      }
    }

    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      select: {
        ratingAvg: true,
        ratingCount: true,
      },
    });

    return {
      average: partner?.ratingAvg || 0,
      total: partner?.ratingCount || 0,
      distribution: ratingDistribution,
    };
  }
}
