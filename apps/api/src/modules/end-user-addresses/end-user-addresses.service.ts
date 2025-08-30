import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EndUserAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAddresses(endUserId: string) {
    const addresses = await this.prisma.endUserAddress.findMany({
      where: {
        endUserId,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return {
      addresses,
      count: addresses.length,
    };
  }

  async getAddress(endUserId: string, addressId: string) {
    const address = await this.prisma.endUserAddress.findFirst({
      where: {
        id: addressId,
        endUserId,
        isActive: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async createAddress(endUserId: string, createAddressDto: {
    type: string;
    label: string;
    area: string;
    pincode: string;
    city: string;
    state: string;
    country?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
  }) {
    try {
      console.log('Creating address for user:', endUserId);
      console.log('Address data:', createAddressDto);
      
      // Verify user exists
      const user = await this.prisma.endUser.findUnique({
        where: { id: endUserId }
      });
      
      if (!user) {
        throw new BadRequestException(`End user with ID ${endUserId} not found`);
      }
      
      // If this is the first address or marked as default, set it as default
      const existingAddresses = await this.prisma.endUserAddress.count({
        where: { endUserId, isActive: true }
      });

      const isDefault = createAddressDto.isDefault || existingAddresses === 0;

      // If setting as default, unset other default addresses
      if (isDefault) {
        await this.prisma.endUserAddress.updateMany({
          where: { endUserId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const addressData = {
        ...createAddressDto,
        endUserId,
        isDefault,
        country: createAddressDto.country || 'India',
        isActive: true,
      };
      
      console.log('Final address data to insert:', addressData);

      const address = await this.prisma.endUserAddress.create({
        data: addressData,
      });

      console.log('Address created successfully:', address);

      return {
        message: 'Address created successfully',
        address,
      };
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  async updateAddress(endUserId: string, addressId: string, updateAddressDto: {
    type?: string;
    label?: string;
    area?: string;
    pincode?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
    isActive?: boolean;
  }) {
    // Check if address exists
    const existingAddress = await this.prisma.endUserAddress.findFirst({
      where: {
        id: addressId,
        endUserId,
        isActive: true,
      },
    });

    if (!existingAddress) {
      throw new NotFoundException('Address not found');
    }

    // If setting as default, unset other default addresses
    if (updateAddressDto.isDefault) {
      await this.prisma.endUserAddress.updateMany({
        where: { 
          endUserId, 
          isDefault: true,
          id: { not: addressId }
        },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await this.prisma.endUserAddress.update({
      where: { id: addressId },
      data: {
        ...updateAddressDto,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Address updated successfully',
      address: updatedAddress,
    };
  }

  async setDefaultAddress(endUserId: string, addressId: string) {
    // Check if address exists
    const address = await this.prisma.endUserAddress.findFirst({
      where: {
        id: addressId,
        endUserId,
        isActive: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Unset all other default addresses for this user
    await this.prisma.endUserAddress.updateMany({
      where: { 
        endUserId, 
        isDefault: true,
        id: { not: addressId }
      },
      data: { isDefault: false }
    });

    // Set this address as default
    const updatedAddress = await this.prisma.endUserAddress.update({
      where: { id: addressId },
      data: { 
        isDefault: true,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Default address set successfully',
      address: updatedAddress,
    };
  }

  async deleteAddress(endUserId: string, addressId: string) {
    // Check if address exists
    const address = await this.prisma.endUserAddress.findFirst({
      where: {
        id: addressId,
        endUserId,
        isActive: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Check if this is the default address
    if (address.isDefault) {
      // Find another address to set as default
      const otherAddress = await this.prisma.endUserAddress.findFirst({
        where: {
          endUserId,
          id: { not: addressId },
          isActive: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      if (otherAddress) {
        await this.prisma.endUserAddress.update({
          where: { id: otherAddress.id },
          data: { isDefault: true }
        });
      }
    }

    // Soft delete by setting isActive to false
    await this.prisma.endUserAddress.update({
      where: { id: addressId },
      data: { 
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Address deleted successfully',
    };
  }
}
