import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import fs from 'fs';

export interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
      expiresIn: '15m',
    });
    // Refresh token rotation stored in DB will come later
    const refreshToken = await this.jwtService.signAsync(payload, {
      privateKey,
      expiresIn: '30d',
    });
    return { accessToken, refreshToken };
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


