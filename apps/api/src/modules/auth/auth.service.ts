import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

export interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.hashedPassword);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async issueTokens(userId: string, role: string) {
    const payload: JwtPayload = { sub: userId, role };
    const privateKey = this.getPrivateKey();
    const accessToken = await this.jwtService.signAsync(payload, {
      privateKey,
      expiresIn: '1h',
    });
    // Refresh token rotation stored in DB will come later
    const refreshToken = await this.jwtService.signAsync(payload, {
      privateKey,
      expiresIn: '30d',
    });
    return { accessToken, refreshToken };
  }

  // OTP Methods
  async generateOTP(mobile: string, userType: string, purpose: string = 'login') {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // Store OTP in database
    const otpRecord = await this.prisma.oTPCode.create({
      data: {
        phone: mobile,
        code: otp,
        purpose: purpose as 'login' | 'register',
        actor: userType === 'end-user' ? 'end_user' : 'partner',
        is_used: false,
        expiresAt,
      },
    });

    return {
      message: 'OTP sent successfully',
      mobile,
      userType,
      expiresIn: 300, // 5 minutes
      otpId: otpRecord.id, // For debugging/admin purposes
    };
  }

  async verifyOTP(mobile: string, otp: string, userType: string, purpose: string = 'login') {
    // Find the OTP record
    const otpRecord = await this.prisma.oTPCode.findFirst({
      where: {
        phone: mobile,
        code: otp,
        purpose: purpose as 'login' | 'register',
        actor: userType === 'end-user' ? 'end_user' : 'partner',
        is_used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { is_used: true },
    });

    return otpRecord;
  }

  async findOrCreateUser(mobile: string, userType: string, userData?: any) {
    if (userType === 'end-user') {
      // Check if end user exists
      let endUser = await this.prisma.endUser.findFirst({
        where: { phone: mobile },
      });

      if (!endUser && userData) {
        // Create new end user
        endUser = await this.prisma.endUser.create({
          data: {
            name: userData.name,
            email: userData.email,
            phone: mobile,
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
            gender: userData.gender,
            status: 'active',
          },
        });
      }

      if (!endUser) {
        throw new UnauthorizedException('User not found and no user data provided for registration');
      }

      return {
        id: endUser.id,
        name: endUser.name,
        email: endUser.email,
        phone: endUser.phone,
        status: endUser.status,
        createdAt: endUser.createdAt,
        type: 'end-user',
      };
    } else if (userType === 'partner') {
      // Check if partner exists
      let partner = await this.prisma.partner.findFirst({
        where: { phone: mobile },
      });

      if (!partner && userData) {
        // Create new partner
        partner = await this.prisma.partner.create({
          data: {
            name: userData.name,
            email: userData.email,
            phone: mobile,
            status: 'active',
            serviceRadiusKm: userData.serviceRadiusKm || 5,
            isAvailable: userData.isAvailable !== undefined ? userData.isAvailable : true,
            pricingType: userData.pricingType || 'hourly',
            priceMin: userData.priceMin,
            priceMax: userData.priceMax,
            plan: userData.plan || 'Basic',
            planStatus: userData.planStatus || 'active',
            boostActive: userData.boostActive || false,
          },
        });
      }

      if (!partner) {
        throw new UnauthorizedException('Partner not found and no partner data provided for registration');
      }

      return {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        status: partner.status,
        createdAt: partner.createdAt,
        type: 'partner',
      };
    }

    throw new UnauthorizedException('Invalid user type');
  }

  async checkPhoneRegistration(mobile: string, userType: string) {
    try {
      if (userType === 'end-user') {
        // Check if end user exists
        const existingUser = await this.prisma.endUser.findFirst({
          where: { phone: mobile },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            status: true,
            createdAt: true,
          }
        });

        if (existingUser) {
          return {
            isRegistered: true,
            existingUser: {
              ...existingUser,
              type: 'end-user'
            },
            message: 'Phone number is already registered'
          };
        }
      } else if (userType === 'partner') {
        // Check if partner exists
        const existingPartner = await this.prisma.partner.findFirst({
          where: { phone: mobile },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            serviceRadiusKm: true,
            isAvailable: true,
            pricingType: true,
            priceMin: true,
            priceMax: true,
            plan: true,
            planStatus: true,
            boostActive: true,
            boostStart: true,
            boostEnd: true,
            ratingAvg: true,
            ratingCount: true,
            createdAt: true,
          }
        });

        if (existingPartner) {
          return {
            isRegistered: true,
            existingUser: {
              ...existingPartner,
              type: 'partner'
            },
            message: 'Phone number is already registered'
          };
        }
      }

      return {
        isRegistered: false,
        message: 'Phone number is available for registration'
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to check phone registration status');
    }
  }

  // New method: Find existing user without creating new one
  async findExistingUser(mobile: string, userType: string) {
    if (userType === 'end-user') {
      const endUser = await this.prisma.endUser.findFirst({
        where: { phone: mobile },
      });

      if (!endUser) {
        throw new UnauthorizedException('End user not found with this mobile number');
      }

      return {
        id: endUser.id,
        name: endUser.name,
        email: endUser.email,
        phone: endUser.phone,
        dateOfBirth: endUser.dateOfBirth,
        gender: endUser.gender,
        status: endUser.status,
        createdAt: endUser.createdAt,
        type: 'end-user',
      };
    } else if (userType === 'partner') {
      const partner = await this.prisma.partner.findFirst({
        where: { phone: mobile },
      });

      if (!partner) {
        throw new UnauthorizedException('Partner not found with this mobile number');
      }

      return {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        status: partner.status,
        serviceRadiusKm: partner.serviceRadiusKm,
        isAvailable: partner.isAvailable,
        pricingType: partner.pricingType,
        priceMin: partner.priceMin,
        priceMax: partner.priceMax,
        plan: partner.plan,
        planStatus: partner.planStatus,
        boostActive: partner.boostActive,
        boostStart: partner.boostStart,
        boostEnd: partner.boostEnd,
        ratingAvg: partner.ratingAvg,
        ratingCount: partner.ratingCount,
        createdAt: partner.createdAt,
        type: 'partner',
      };
    }

    throw new UnauthorizedException('Invalid user type');
  }

  async listOTPs(limit: number) {
    const otps = await this.prisma.oTPCode.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phone: true,
        code: true,
        purpose: true,
        actor: true,
        is_used: true,
        expiresAt: true,
        createdAt: true,
      }
    });

    const total = await this.prisma.oTPCode.count();
    
    return {
      otps: otps.map((otp: any) => ({
        ...otp,
        isUsed: otp.is_used,
        userType: otp.actor === 'end_user' ? 'end-user' : 'partner'
      })),
      pagination: {
        page: 1,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async clearExpiredOTPs() {
    const deletedCount = await this.prisma.oTPCode.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    return {
      message: 'Expired OTPs cleared successfully',
      deletedCount: deletedCount.count
    };
  }

  private getPrivateKey(): string {
    const keyFromEnv = process.env.JWT_PRIVATE_KEY;
    if (keyFromEnv && keyFromEnv.includes('BEGIN')) {
      return keyFromEnv.replace(/\\n/g, '\n');
    }
    const keyPath = process.env.JWT_PRIVATE_KEY_PATH;
    if (keyPath && fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8');
    }
    throw new Error('JWT private key not configured. Set JWT_PRIVATE_KEY or JWT_PRIVATE_KEY_PATH');
  }
}


