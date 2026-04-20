import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload, UserPublic } from '../../domain/user.entity';
import {
  AuthResult,
  AuthServicePort,
  LoginInput,
  RegisterInput,
} from '../ports/auth-service.port';
import {
  USER_REPOSITORY_PORT,
  UserRepositoryPort,
} from '../ports/user-repository.port';

@Injectable()
export class AuthService implements AuthServicePort {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepo: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(input.email, input.tenantId);
    if (existing) {
      throw new ConflictException('Email already registered for this tenant');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.userRepo.create({
      id: uuidv4(),
      tenantId: input.tenantId,
      email: input.email,
      passwordHash,
      role: input.role ?? 'user',
    });

    const userPublic: UserPublic = this.toPublic(user);
    const accessToken = this.signToken(userPublic);

    return { accessToken, user: userPublic };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(input.email, input.tenantId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userPublic: UserPublic = this.toPublic(user);
    const accessToken = this.signToken(userPublic);

    return { accessToken, user: userPublic };
  }

  private toPublic(user: any): UserPublic {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private signToken(user: UserPublic): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    return this.jwtService.sign(payload);
  }
}
