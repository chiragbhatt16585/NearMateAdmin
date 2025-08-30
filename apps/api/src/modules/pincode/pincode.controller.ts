import { Controller, Get, Query, Param } from '@nestjs/common';
import { PincodeService } from './pincode.service';

@Controller('api/v1/pincode')
export class PincodeController {
  constructor(private readonly pincodeService: PincodeService) {}

  @Get('lookup/:pincode')
  async lookupPincode(@Param('pincode') pincode: string) {
    const data = await this.pincodeService.findByPincode(pincode);
    return { 
      found: data.length > 0,
      count: data.length,
      offices: data
    };
  }

  @Get('search')
  async searchPincodes(
    @Query('q') query: string,
    @Query('limit') limit: string = '10'
  ) {
    const limitNum = parseInt(limit) || 10;
    const results = await this.pincodeService.searchPincodes(query, limitNum);
    return { results };
  }

  @Get('states')
  async getStates() {
    const states = await this.pincodeService.getStates();
    return { states };
  }

  @Get('cities/:state')
  async getCitiesByState(@Param('state') state: string) {
    const cities = await this.pincodeService.getCitiesByState(state);
    return { cities };
  }

  @Get('districts/:city')
  async getDistrictsByCity(@Param('city') city: string) {
    const districts = await this.pincodeService.getDistrictsByCity(city);
    return { districts };
  }
}
