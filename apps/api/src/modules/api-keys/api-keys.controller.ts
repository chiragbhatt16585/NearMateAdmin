import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ApiKeysService } from './api-keys.service';

@Controller('api/v1/api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async createApiKey(
    @Req() req: any,
    @Body() data: {
      name: string;
      permissions: string[];
      expiresAt?: string;
    }
  ) {
    const userId = req.user.id;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;
    
    return await this.apiKeysService.createApiKey(userId, {
      ...data,
      expiresAt,
    });
  }

  @Get()
  async getUserApiKeys(@Req() req: any) {
    const userId = req.user.id;
    return await this.apiKeysService.getUserApiKeys(userId);
  }

  @Patch(':id')
  async updateApiKey(
    @Req() req: any,
    @Param('id') apiKeyId: string,
    @Body() data: {
      name?: string;
      permissions?: string[];
      isActive?: boolean;
      expiresAt?: string;
    }
  ) {
    const userId = req.user.id;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;
    
    return await this.apiKeysService.updateApiKey(userId, apiKeyId, {
      ...data,
      expiresAt,
    });
  }

  @Delete(':id')
  async deleteApiKey(@Req() req: any, @Param('id') apiKeyId: string) {
    const userId = req.user.id;
    return await this.apiKeysService.deleteApiKey(userId, apiKeyId);
  }

  @Post(':id/regenerate')
  async regenerateApiKey(@Req() req: any, @Param('id') apiKeyId: string) {
    const userId = req.user.id;
    return await this.apiKeysService.regenerateApiKey(userId, apiKeyId);
  }
}
