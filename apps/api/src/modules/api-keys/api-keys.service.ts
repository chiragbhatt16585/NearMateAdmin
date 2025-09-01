import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async createApiKey(userId: string, data: {
    name: string;
    permissions: string[];
    expiresAt?: Date;
  }) {
    // Generate a secure API key
    const apiKey = this.generateApiKey();
    
    const newApiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name: data.name,
        key: apiKey,
        permissions: data.permissions,
        expiresAt: data.expiresAt,
      },
    });

    return {
      message: 'API key created successfully',
      apiKey: {
        id: newApiKey.id,
        name: newApiKey.name,
        key: newApiKey.key, // Only return the key once
        permissions: newApiKey.permissions,
        isActive: newApiKey.isActive,
        expiresAt: newApiKey.expiresAt,
        createdAt: newApiKey.createdAt,
      },
    };
  }

  async validateApiKey(apiKey: string, requiredPermissions: string[] = []) {
    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!keyRecord) {
      throw new BadRequestException('Invalid API key');
    }

    if (!keyRecord.isActive) {
      throw new BadRequestException('API key is inactive');
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      throw new BadRequestException('API key has expired');
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(permission => 
        (keyRecord.permissions as string[]).includes(permission)
      );
      
      if (!hasPermission) {
        throw new BadRequestException('Insufficient permissions');
      }
    }

    // Update last used timestamp
    await this.prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    });

    return {
      userId: keyRecord.userId,
      permissions: keyRecord.permissions as string[],
      user: keyRecord.user,
    };
  }

  async getUserApiKeys(userId: string) {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        permissions: true,
        isActive: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { apiKeys };
  }

  async updateApiKey(userId: string, apiKeyId: string, data: {
    name?: string;
    permissions?: string[];
    isActive?: boolean;
    expiresAt?: Date;
  }) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    const updatedApiKey = await this.prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'API key updated successfully',
      apiKey: {
        id: updatedApiKey.id,
        name: updatedApiKey.name,
        permissions: updatedApiKey.permissions,
        isActive: updatedApiKey.isActive,
        expiresAt: updatedApiKey.expiresAt,
        updatedAt: updatedApiKey.updatedAt,
      },
    };
  }

  async deleteApiKey(userId: string, apiKeyId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.delete({
      where: { id: apiKeyId },
    });

    return { message: 'API key deleted successfully' };
  }

  async regenerateApiKey(userId: string, apiKeyId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    const newKey = this.generateApiKey();
    
    const updatedApiKey = await this.prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        key: newKey,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'API key regenerated successfully',
      apiKey: {
        id: updatedApiKey.id,
        name: updatedApiKey.name,
        key: newKey, // Return the new key
        permissions: updatedApiKey.permissions,
        isActive: updatedApiKey.isActive,
        expiresAt: updatedApiKey.expiresAt,
        updatedAt: updatedApiKey.updatedAt,
      },
    };
  }

  private generateApiKey(): string {
    // Generate a 32-character secure API key
    return randomBytes(16).toString('hex');
  }
}
