import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../api-keys/api-key.guard';
import { CategoriesService } from '../categories/categories.service';
import { PincodeService } from '../pincode/pincode.service';

@Controller('api/v1/public')
@UseGuards(ApiKeyGuard)
export class PublicApiController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly pincodeService: PincodeService,
  ) {}

  @Get('categories')
  async getCategories() {
    const categories = await this.categoriesService.list();
    return {
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('pincode/lookup/:pincode')
  async lookupPincode(pincode: string) {
    console.log(`🔍 PublicApiController.lookupPincode called with: "${pincode}"`);
    console.log(`🔍 Controller instance: ${this.constructor.name}`);
    console.log(`🔍 PincodeService instance: ${this.pincodeService.constructor.name}`);
    
    const data = await this.pincodeService.findByPincode(pincode);
    
    console.log(`📊 Service returned ${data.length} records`);
    if (data.length > 0) {
      console.log(`📊 First record: ${JSON.stringify(data[0])}`);
    }
    console.log(`📤 Controller returning: found=${data.length > 0}, count=${data.length}`);
    
    return {
      success: true,
      found: data.length > 0,
      count: data.length,
      data: data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('pincode/search')
  async searchPincodes(
    @Query('q') query: string,
    @Query('limit') limit: string = '10'
  ) {
    const limitNum = parseInt(limit) || 10;
    const results = await this.pincodeService.searchPincodes(query, limitNum);
    return {
      success: true,
      results: results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('pincode/states')
  async getStates() {
    const states = await this.pincodeService.getStates();
    return {
      success: true,
      states: states,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('pincode/cities/:state')
  async getCitiesByState(state: string) {
    const cities = await this.pincodeService.getCitiesByState(state);
    return {
      success: true,
      cities: cities,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Public API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
