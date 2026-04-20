export type UserRole = 'admin' | 'user';

export interface User {
  id: string;           // UUID v4
  tenantId: string;     // UUID v4 — FK to tenants.id
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Projection returned to callers — never exposes passwordHash
export interface UserPublic {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Shape of req.user after JwtStrategy.validate()
export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

// JWT payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}
