import { apiClient } from './client';
import type { AuthResult, LoginInput, RegisterInput } from '../types';

export async function login(input: LoginInput): Promise<AuthResult> {
  return apiClient.post<AuthResult>(
    '/auth/login',
    { email: input.email, password: input.password },
    { 'X-Tenant-Id': input.tenantId },
  );
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  return apiClient.post<AuthResult>(
    '/auth/register',
    { email: input.email, password: input.password, role: input.role },
    { 'X-Tenant-Id': input.tenantId },
  );
}
