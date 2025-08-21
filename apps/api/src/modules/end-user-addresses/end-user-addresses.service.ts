import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EndUserAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(endUserId: string, data: {
    type: string;
    label: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
  }) {
    // If this is the first address or marked as default, set it as default
    if (data.isDefault) {
      await this.prisma.endUserAddress.updateMany({
        where: { endUserId },
        data: { isDefault: false }
      });
    }

    return this.prisma.endUserAddress.create({
      data: {
        ...data,
        endUserId,
        country: data.country || 'India',
      },
      include: {
        endUser: true,
      }
    });
  }

  async findAll(endUserId: string) {
    return this.prisma.endUserAddress.findMany({
      where: { endUserId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findOne(id: string) {
    const address = await this.prisma.endUserAddress.findUnique({
      where: { id },
      include: {
        endUser: true,
      }
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(id: string, data: {
    type?: string;
    label?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
    isActive?: boolean;
  }) {
    const address = await this.findOne(id);

    // If setting as default, unset other addresses as default
    if (data.isDefault) {
      await this.prisma.endUserAddress.updateMany({
        where: { 
          endUserId: address.endUserId,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    return this.prisma.endUserAddress.update({
      where: { id },
      data,
      include: {
        endUser: true,
      }
    });
  }

  async remove(id: string) {
    const address = await this.findOne(id);
    
    // If this is the default address, don't allow deletion
    if (address.isDefault) {
      throw new BadRequestException('Cannot delete default address');
    }

    return this.prisma.endUserAddress.delete({
      where: { id }
    });
  }

  async setDefault(id: string) {
    const address = await this.findOne(id);
    
    // Unset other addresses as default
    await this.prisma.endUserAddress.updateMany({
      where: { 
        endUserId: address.endUserId,
        id: { not: id }
      },
      data: { isDefault: false }
    });

    // Set this address as default
    return this.prisma.endUserAddress.update({
      where: { id },
      data: { isDefault: true },
      include: {
        endUser: true,
      }
    });
  }
}
