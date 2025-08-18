import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
}


