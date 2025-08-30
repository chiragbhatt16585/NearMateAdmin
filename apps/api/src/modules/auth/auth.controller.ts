import { Body, Controller, HttpCode, Post, Get, Query, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    const tokens = await this.authService.issueTokens(user.id, user.role);
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
  }

  // OTP Endpoints
  @Post('request-otp')
  @HttpCode(200)
  async requestOTP(@Body() body: { mobile: string; userType: string; purpose?: string }) {
    const purpose = body.purpose || 'login';
    return await this.authService.generateOTP(body.mobile, body.userType, purpose);
  }

  @Post('verify-otp-register')
  @HttpCode(200)
  async verifyOTPRegister(@Body() body: { 
    mobile: string; 
    otp: string; 
    userType: string; 
    userData?: any 
  }) {
    // Verify OTP
    await this.authService.verifyOTP(body.mobile, body.otp, body.userType, 'register');
    
    // Find or create user
    const user = await this.authService.findOrCreateUser(body.mobile, body.userType, body.userData);
    
    // Issue tokens
    const tokens = await this.authService.issueTokens(user.id, user.type);
    
    return {
      user,
      ...tokens,
      message: 'User registered successfully'
    };
  }

  @Post('verify-otp-login')
  @HttpCode(200)
  async verifyOTPLogin(@Body() body: { 
    mobile: string; 
    otp: string; 
    userType: string 
  }) {
    // Verify OTP
    await this.authService.verifyOTP(body.mobile, body.otp, body.userType, 'login');
    
    // Find user (don't create new one for login)
    const user = await this.authService.findOrCreateUser(body.mobile, body.userType);
    
    // Issue tokens
    const tokens = await this.authService.issueTokens(user.id, user.type);
    
    return {
      user,
      ...tokens,
      message: 'Login successful'
    };
  }

  // New endpoint: Check if mobile exists and get user info for login
  @Post('check-mobile-exists')
  @HttpCode(200)
  async checkMobileExists(@Body() body: { mobile: string; userType: string }) {
    return await this.authService.checkPhoneRegistration(body.mobile, body.userType);
  }

  // New endpoint: Login with mobile OTP (for existing users)
  @Post('login-with-mobile')
  @HttpCode(200)
  async loginWithMobile(@Body() body: { 
    mobile: string; 
    otp: string; 
    userType: string 
  }) {
    // Verify OTP
    await this.authService.verifyOTP(body.mobile, body.otp, body.userType, 'login');
    
    // Find existing user (don't create new one)
    const user = await this.authService.findExistingUser(body.mobile, body.userType);
    
    // Issue tokens
    const tokens = await this.authService.issueTokens(user.id, user.type);
    
    return {
      user,
      ...tokens,
      message: 'Login successful'
    };
  }

  // Admin endpoints for OTP management
  @Get('otps')
  @UseGuards(JwtAuthGuard)
  async listOTPs(@Query('limit') limit: string = '10') {
    return await this.authService.listOTPs(parseInt(limit) || 10);
  }

  @Delete('otps/expired')
  @UseGuards(JwtAuthGuard)
  async clearExpiredOTPs() {
    return await this.authService.clearExpiredOTPs();
  }
}


