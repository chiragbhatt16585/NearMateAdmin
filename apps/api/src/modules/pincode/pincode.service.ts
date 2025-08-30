import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PincodeData {
  pincode: string;
  district: string;
  city: string;
  state: string;
  area: string | null | undefined;
}

@Injectable()
export class PincodeService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPincode(pincode: string): Promise<PincodeData[]> {
    try {
      // Return all offices/records for this pincode
      const records = await this.prisma.pincodeData.findMany({
        where: { pincode },
        orderBy: [{ city: 'asc' }, { district: 'asc' }, { area: 'asc' }],
      });

      return records.map(r => ({
        pincode: r.pincode,
        district: r.district,
        city: r.city,
        state: r.state,
        area: r.area,
      }));
    } catch (error) {
      console.error('Error looking up pincode:', error);
      return [];
    }
  }

  async searchPincodes(query: string, limit: number = 10): Promise<PincodeData[]> {
    try {
      const pincodes = await this.prisma.pincodeData.findMany({
        where: {
          OR: [
            { pincode: { startsWith: query } },
            { city: { contains: query } },
            { district: { contains: query } },
            { state: { contains: query } },
          ],
        },
        take: limit,
        orderBy: { pincode: 'asc' },
      });

      return pincodes.map(record => ({
        pincode: record.pincode,
        district: record.district,
        city: record.city,
        state: record.state,
        area: record.area,
      }));
    } catch (error) {
      console.error('Error searching pincodes:', error);
      return [];
    }
  }

  async getStates(): Promise<string[]> {
    try {
      const states = await this.prisma.pincodeData.findMany({
        select: { state: true },
        distinct: ['state'],
        orderBy: { state: 'asc' },
      });

      return states.map(s => s.state);
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
    }
  }

  async getCitiesByState(state: string): Promise<string[]> {
    try {
      const cities = await this.prisma.pincodeData.findMany({
        where: { state },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
      });

      return cities.map(c => c.city);
    } catch (error) {
      console.error('Error fetching cities by state:', error);
      return [];
    }
  }

  async getDistrictsByCity(city: string): Promise<string[]> {
    try {
      const districts = await this.prisma.pincodeData.findMany({
        where: { city },
        select: { district: true },
        distinct: ['district'],
        orderBy: { district: 'asc' },
      });

      return districts.map(d => d.district);
    } catch (error) {
      console.error('Error fetching districts by city:', error);
      return [];
    }
  }
}
