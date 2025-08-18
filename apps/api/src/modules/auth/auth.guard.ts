import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import fs from 'fs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice(7);
    const key = this.getVerificationKey();
    try {
      const payload = this.jwtService.verify(token, {
        algorithms: ['RS256'],
        publicKey: key,
      } as any);
      request.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private getVerificationKey(): string {
    // Prefer explicit public key, fallback to private for local dev
    const publicKey = process.env.JWT_PUBLIC_KEY;
    if (publicKey && publicKey.includes('BEGIN')) {
      return publicKey.replace(/\\n/g, '\n');
    }
    const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH;
    if (publicKeyPath && fs.existsSync(publicKeyPath)) {
      return fs.readFileSync(publicKeyPath, 'utf8');
    }
    const privateKey = process.env.JWT_PRIVATE_KEY;
    if (privateKey && privateKey.includes('BEGIN')) {
      return privateKey.replace(/\\n/g, '\n');
    }
    const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH;
    if (privateKeyPath && fs.existsSync(privateKeyPath)) {
      return fs.readFileSync(privateKeyPath, 'utf8');
    }
    throw new Error('JWT public/private key not configured');
  }
}


