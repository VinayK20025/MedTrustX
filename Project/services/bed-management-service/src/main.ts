import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.NODE_ENV === 'development' ? '*' : [],
    credentials: true,
    exposedHeaders: ['X-Tenant-ID', 'X-Request-ID'],
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`bed-management-service running on port ${port}`, 'Bootstrap');
}
bootstrap();
