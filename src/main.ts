console.log('ENV CHECK:', {
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
});

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];
  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'x-tenant-id'],
    exposedHeaders: ['X-Tenant-Id'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap();
