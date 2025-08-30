import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EndUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    phone: string;
    name: string;
    dateOfBirth?: Date;
    gender?: string;
  }) {
    // Check if email or phone already exists
    const existing = await this.prisma.endUser.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone }
        ]
      }
    });

    if (existing) {
      throw new ConflictException('Email or phone already exists');
    }

    return this.prisma.endUser.create({
      data: {
        email: data.email,
        phone: data.phone,
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      },
      include: {
        addresses: true,
        bookings: {
          include: {
            partner: true,
            category: true,
            address: true,
          }
        },
        // billingHistory: true, // Removed - field doesn't exist in schema
        reviews: true,
      }
    });
  }

  async findAll(query?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      console.log('EndUsersService.findAll called with query:', query);
      
      const { search, status, page = 1, limit = 20 } = query || {};
      
      const where: Prisma.EndUserWhereInput = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ];
      }
      
      if (status) {
        where.status = status;
      }

      console.log('Prisma where clause:', where);

      const [users, total] = await Promise.all([
        this.prisma.endUser.findMany({
          where,
          include: {
            addresses: true,
            bookings: {
              include: {
                partner: true,
                category: true,
              }
            },
            reviews: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.endUser.count({ where }),
      ]);

      console.log(`Found ${users.length} users, total: ${total}`);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      console.error('Error in EndUsersService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.endUser.findUnique({
      where: { id },
      include: {
        addresses: true,
        bookings: {
          include: {
            partner: true,
            category: true,
            address: true,
            billing: true,
            review: true,
          }
        },
        // billingHistory: true, // Removed - field doesn't exist in schema
        reviews: true,
      }
    });

    if (!user) {
      throw new NotFoundException('End user not found');
    }

    return user;
  }

  async update(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    status?: string;
  }) {
    // Check if email or phone already exists for other users
    if (data.email || data.phone) {
      const existing = await this.prisma.endUser.findFirst({
        where: {
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.phone ? [{ phone: data.phone }] : []),
          ],
          NOT: { id }
        }
      });

      if (existing) {
        throw new ConflictException('Email or phone already exists');
      }
    }

    return this.prisma.endUser.update({
      where: { id },
      data,
      include: {
        addresses: true,
        bookings: {
          include: {
            partner: true,
            category: true,
            address: true,
          }
        },
        // billingHistory: true, // Removed - field doesn't exist in schema
        reviews: true,
      }
    });
  }

  async remove(id: string) {
    // Check if user has any active bookings
    const activeBookings = await this.prisma.endUserBooking.findFirst({
      where: {
        endUserId: id,
        status: { in: ['pending', 'confirmed', 'in-progress'] }
      }
    });

    if (activeBookings) {
      throw new BadRequestException('Cannot delete user with active bookings');
    }

    return this.prisma.endUser.delete({
      where: { id }
    });
  }

  async getStats(id: string) {
    const user = await this.findOne(id);
    
    const stats = {
      totalBookings: user.bookings?.length || 0,
      completedBookings: user.bookings?.filter((b: any) => b.status === 'completed').length || 0,
      totalSpent: user.bookings?.reduce((sum: number, booking: any) => {
        return sum + (booking.billing?.finalAmount || 0);
      }, 0) || 0,
      averageRating: user.reviews?.length > 0 
        ? user.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / user.reviews.length 
        : 0,
      totalAddresses: user.addresses?.length || 0,
      activeAddresses: user.addresses?.filter((a: any) => a.isActive).length || 0,
    };

    return stats;
  }
}
