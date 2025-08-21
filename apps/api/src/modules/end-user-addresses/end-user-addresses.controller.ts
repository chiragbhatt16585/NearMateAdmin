import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { EndUserAddressesService } from './end-user-addresses.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/end-users/:endUserId/addresses')
export class EndUserAddressesController {
  constructor(private readonly endUserAddressesService: EndUserAddressesService) {}

  @Post()
  create(
    @Param('endUserId') endUserId: string,
    @Body() createAddressDto: {
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
    }
  ) {
    return this.endUserAddressesService.create(endUserId, createAddressDto);
  }

  @Get()
  findAll(@Param('endUserId') endUserId: string) {
    return this.endUserAddressesService.findAll(endUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.endUserAddressesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateAddressDto: {
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
    }
  ) {
    return this.endUserAddressesService.update(id, updateAddressDto);
  }

  @Patch(':id/set-default')
  setDefault(@Param('id') id: string) {
    return this.endUserAddressesService.setDefault(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.endUserAddressesService.remove(id);
  }
}
