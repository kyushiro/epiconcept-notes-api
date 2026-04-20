import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { NotesModule } from './modules/notes/notes.module';
import { SharedModule } from './modules/shared/shared.module';
import { TenantMiddleware } from './modules/shared/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    SharedModule,
    AuthModule,
    NotesModule,
    MeetingsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
