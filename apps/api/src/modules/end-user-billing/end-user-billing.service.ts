import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EndUserBillingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(endUserId: string, data: {
    bookingId: string;
    amount: number;
    currency?: string;
    taxAmount?: number;
    discountAmount?: number;
    paymentMethod?: string;
    invoiceNumber?: string;
    dueDate?: string;
  }) {
    // Validate booking exists and belongs to the user
    const booking = await this.prisma.endUserBooking.findFirst({
      where: {
        id: data.bookingId,
        endUserId,
      }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if billing already exists for this booking
    const existingBilling = await this.prisma.endUserBilling.findUnique({
      where: { bookingId: data.bookingId }
    });

    if (existingBilling) {
      throw new BadRequestException('Billing already exists for this booking');
    }

    const finalAmount = (data.amount || 0) + (data.taxAmount || 0) - (data.discountAmount || 0);

    return this.prisma.endUserBilling.create({
      data: {
        endUserId,
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency || 'INR',
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        finalAmount,
        paymentMethod: data.paymentMethod,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        endUser: true,
        booking: {
          include: {
            partner: true,
            category: true,
          }
        },
      }
    });
  }

  async findAll(endUserId: string, query?: {
    paymentStatus?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }) {
    const { paymentStatus, paymentMethod, page = 1, limit = 20 } = query || {};
    
    const where: any = { endUserId };
    
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const [billings, total] = await Promise.all([
      this.prisma.endUserBilling.findMany({
        where,
        include: {
          booking: {
            include: {
              partner: true,
              category: true,
            }
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.endUserBilling.count({ where }),
    ]);

    return {
      billings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  async findOne(id: string) {
    const billing = await this.prisma.endUserBilling.findUnique({
      where: { id },
      include: {
        endUser: true,
        booking: {
          include: {
            partner: true,
            category: true,
          }
        },
      }
    });

    if (!billing) {
      throw new NotFoundException('Billing record not found');
    }

    return billing;
  }

  async update(id: string, data: {
    amount?: number;
    taxAmount?: number;
    discountAmount?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    transactionId?: string;
    paidAt?: string;
    invoiceNumber?: string;
    dueDate?: string;
  }) {
    const billing = await this.findOne(id);

    const updateData: any = { ...data };
    
    if (data.paidAt) {
      updateData.paidAt = new Date(data.paidAt);
    }
    
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    // Recalculate final amount if any price components changed
    if (data.amount !== undefined || data.taxAmount !== undefined || data.discountAmount !== undefined) {
      const amount = data.amount ?? billing.amount;
      const taxAmount = data.taxAmount ?? billing.taxAmount;
      const discountAmount = data.discountAmount ?? billing.discountAmount;
      updateData.finalAmount = amount + taxAmount - discountAmount;
    }

    return this.prisma.endUserBilling.update({
      where: { id },
      data: updateData,
      include: {
        endUser: true,
        booking: {
          include: {
            partner: true,
            category: true,
          }
        },
      }
    });
  }

  async markAsPaid(id: string, data: {
    paymentMethod: string;
    transactionId?: string;
  }) {
    const billing = await this.findOne(id);

    if (billing.paymentStatus === 'paid') {
      throw new BadRequestException('Billing is already marked as paid');
    }

    return this.prisma.endUserBilling.update({
      where: { id },
      data: {
        paymentStatus: 'paid',
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        paidAt: new Date(),
      },
      include: {
        endUser: true,
        booking: {
          include: {
            partner: true,
            category: true,
          }
        },
      }
    });
  }

  async getStats(endUserId: string) {
    const billings = await this.prisma.endUserBilling.findMany({
      where: { endUserId },
    });

    const stats = {
      total: billings.length,
      paid: billings.filter(b => b.paymentStatus === 'paid').length,
      pending: billings.filter(b => b.paymentStatus === 'pending').length,
      failed: billings.filter(b => b.paymentStatus === 'failed').length,
      totalAmount: billings.reduce((sum, b) => sum + b.amount, 0),
      totalPaid: billings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.finalAmount, 0),
      totalPending: billings
        .filter(b => b.paymentStatus === 'pending')
        .reduce((sum, b) => sum + b.finalAmount, 0),
      averageAmount: billings.length > 0 
        ? billings.reduce((sum, b) => sum + b.amount, 0) / billings.length 
        : 0,
    };

    return stats;
  }
}
