import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user'; // defaults to 'user' in use-case
}
// tenantId is injected from X-Tenant-Id header via @TenantId() param decorator — NOT in body
