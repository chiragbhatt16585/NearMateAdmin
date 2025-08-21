import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EndUserBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(endUserId: string, data: {
    partnerId: string;
    categoryId: string;
    serviceDescription?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    priority?: string;
    addressId?: string;
    customAddress?: string;
    lat?: number;
    lng?: number;
    quotedPrice?: number;
  }) {
    // Validate partner exists and is available
    const partner = await this.prisma.partner.findUnique({
      where: { id: data.partnerId }
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (!partner.isAvailable) {
      throw new BadRequestException('Partner is not available');
    }

    // Validate category exists
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    // If addressId is provided, validate it belongs to the user
    if (data.addressId) {
      const address = await this.prisma.endUserAddress.findFirst({
        where: {
          id: data.addressId,
          endUserId,
          isActive: true
        }
      });

      if (!address) {
        throw new BadRequestException('Invalid address');
      }
    }

    const booking = await this.prisma.endUserBooking.create({
      data: {
        endUserId,
        partnerId: data.partnerId,
        categoryId: data.categoryId,
        serviceDescription: data.serviceDescription,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        scheduledTime: data.scheduledTime,
        priority: data.priority || 'normal',
        addressId: data.addressId,
        customAddress: data.customAddress,
        lat: data.lat,
        lng: data.lng,
        quotedPrice: data.quotedPrice,
      },
      include: {
        endUser: true,
        partner: true,
        category: true,
        address: true,
      }
    });

    // Create initial billing record
    if (data.quotedPrice) {
      await this.prisma.endUserBilling.create({
        data: {
          endUserId,
          bookingId: booking.id,
          amount: data.quotedPrice,
          finalAmount: data.quotedPrice,
        }
      });
    }

    return booking;
  }

  async findAll(endUserId: string, query?: {
    status?: string;
    partnerId?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, partnerId, categoryId, page = 1, limit = 20 } = query || {};
    
    const where: any = { endUserId };
    
    if (status) where.status = status;
    if (partnerId) where.partnerId = partnerId;
    if (categoryId) where.categoryId = categoryId;

    const [bookings, total] = await Promise.all([
      this.prisma.endUserBooking.findMany({
        where,
        include: {
          partner: true,
          category: true,
          address: true,
          billing: true,
          review: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.endUserBooking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  async findOne(id: string) {
    const booking = await this.prisma.endUserBooking.findUnique({
      where: { id },
      include: {
        endUser: true,
        partner: true,
        category: true,
        address: true,
        billing: true,
        review: true,
      }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async update(id: string, data: {
    serviceDescription?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    priority?: string;
    status?: string;
    quotedPrice?: number;
    finalPrice?: number;
    paymentStatus?: string;
  }) {
    const booking = await this.findOne(id);

    // Validate status transition
    if (data.status && !this.isValidStatusTransition(booking.status, data.status)) {
      throw new BadRequestException(`Invalid status transition from ${booking.status} to ${data.status}`);
    }

    const updateData: any = { ...data };
    if (data.scheduledDate) {
      updateData.scheduledDate = new Date(data.scheduledDate);
    }

    const updatedBooking = await this.prisma.endUserBooking.update({
      where: { id },
      data: updateData,
      include: {
        endUser: true,
        partner: true,
        category: true,
        address: true,
        billing: true,
        review: true,
      }
    });

    // Update billing if price changed
    if (data.quotedPrice || data.finalPrice) {
      const billing = await this.prisma.endUserBilling.findUnique({
        where: { bookingId: id }
      });

      if (billing) {
        await this.prisma.endUserBilling.update({
          where: { id: billing.id },
          data: {
            amount: data.quotedPrice || billing.amount,
            finalAmount: data.finalPrice || data.quotedPrice || billing.finalAmount,
          }
        });
      }
    }

    return updatedBooking;
  }

  async remove(id: string) {
    const booking = await this.findOne(id);
    
    // Only allow cancellation of pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel booking in current status');
    }

    return this.prisma.endUserBooking.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        endUser: true,
        partner: true,
        category: true,
        address: true,
        billing: true,
        review: true,
      }
    });
  }

  async getStats(endUserId: string) {
    const bookings = await this.prisma.endUserBooking.findMany({
      where: { endUserId },
      include: {
        billing: true,
      }
    });

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      inProgress: bookings.filter(b => b.status === 'in-progress').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalSpent: bookings
        .filter(b => b.billing)
        .reduce((sum, b) => sum + (b.billing?.finalAmount || 0), 0),
      averageRating: 0, // Will be calculated from reviews
    };

    return stats;
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
