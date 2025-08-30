import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { EndUserAddressesService } from './end-user-addresses.service';

@Controller('api/v1/end-users/:endUserId/addresses')
@UseGuards(JwtAuthGuard)
export class EndUserAddressesController {
  constructor(private readonly endUserAddressesService: EndUserAddressesService) {}

  @Get()
  async getAddresses(@Param('endUserId') endUserId: string) {
    return await this.endUserAddressesService.getAddresses(endUserId);
  }

  @Get(':id')
  async getAddress(
    @Param('endUserId') endUserId: string,
    @Param('id') addressId: string
  ) {
    return await this.endUserAddressesService.getAddress(endUserId, addressId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @Param('endUserId') endUserId: string,
    @Body() createAddressDto: {
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
    }
  ) {
    return await this.endUserAddressesService.createAddress(endUserId, createAddressDto);
  }

  @Patch(':id')
  async updateAddress(
    @Param('endUserId') endUserId: string,
    @Param('id') addressId: string,
    @Body() updateAddressDto: {
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
    }
  ) {
    return await this.endUserAddressesService.updateAddress(endUserId, addressId, updateAddressDto);
  }

  @Patch(':id/set-default')
  async setDefaultAddress(
    @Param('endUserId') endUserId: string,
    @Param('id') addressId: string
  ) {
    return await this.endUserAddressesService.setDefaultAddress(endUserId, addressId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(
    @Param('endUserId') endUserId: string,
    @Param('id') addressId: string
  ) {
    await this.endUserAddressesService.deleteAddress(endUserId, addressId);
    return { message: 'Address deleted successfully' };
  }
}
