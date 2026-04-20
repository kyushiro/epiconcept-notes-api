import { User } from '../../domain/user.entity';

export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';

export interface UserRepositoryPort {
  findById(id: string, tenantId: string): Promise<User | null>;
  findByEmail(email: string, tenantId: string): Promise<User | null>;
  create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
}
