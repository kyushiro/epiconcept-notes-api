import { UserPublic, UserRole } from '../../domain/user.entity';

export const AUTH_SERVICE_PORT = 'AUTH_SERVICE_PORT';

export interface RegisterInput {
  tenantId: string;
  email: string;
  password: string;   // plain-text; hashed inside use-case
  role?: UserRole;    // defaults to 'user'
}

export interface LoginInput {
  tenantId: string;
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;  // signed JWT
  user: UserPublic;
}

export interface AuthServicePort {
  register(input: RegisterInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
}
