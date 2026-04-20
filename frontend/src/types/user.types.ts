export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface LoginInput {
  tenantId: string;
  email: string;
  password: string;
}

export interface RegisterInput {
  tenantId: string;
  email: string;
  password: string;
  role?: UserRole;
}
