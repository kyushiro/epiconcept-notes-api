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

  app.enableCors({
    origin: 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'x-tenant-id'],
    exposedHeaders: ['X-Tenant-Id'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap();
