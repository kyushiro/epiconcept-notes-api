import { Module } from '@nestjs/common';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [JwtGuard, RolesGuard],
  exports: [JwtGuard, RolesGuard],
})
export class SharedModule {}
