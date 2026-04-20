import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from '../shared/shared.module';
import { AUTH_SERVICE_PORT } from './application/ports/auth-service.port';
import { USER_REPOSITORY_PORT } from './application/ports/user-repository.port';
import { AuthService } from './application/use-cases/auth.service';
import { AuthController } from './infrastructure/in/auth.controller';
import { JwtStrategy } from './infrastructure/out/jwt.strategy';
import { UserKyselyRepository } from './infrastructure/out/user-kysely.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return {
          secret,
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' },
        };
      },
    }),
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: USER_REPOSITORY_PORT,
      useClass: UserKyselyRepository,
    },
    {
      provide: AUTH_SERVICE_PORT,
      useClass: AuthService,
    },
  ],
  exports: [AUTH_SERVICE_PORT],
})
export class AuthModule {}
