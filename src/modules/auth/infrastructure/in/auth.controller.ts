import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../../../shared/guards/jwt.guard';
import { TenantId } from '../../../shared/decorators/tenant-id.decorator';
import {
  AUTH_SERVICE_PORT,
  AuthServicePort,
} from '../../application/ports/auth-service.port';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_PORT)
    private readonly authService: AuthServicePort,
  ) {}

  @Post('register')
  register(@TenantId() tenantId: string, @Body() dto: RegisterDto) {
    return this.authService.register({
      tenantId,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });
  }

  @Post('login')
  login(@TenantId() tenantId: string, @Body() dto: LoginDto) {
    return this.authService.login({
      tenantId,
      email: dto.email,
      password: dto.password,
    });
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return (req as any).user;
  }
}
