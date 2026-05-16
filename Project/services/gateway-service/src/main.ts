import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug'] });
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
    exposedHeaders: ['X-Tenant-ID', 'X-Request-ID'],
  });
  
  // Set global API prefix
  app.setGlobalPrefix('api/v1');
  
  // Configure WebSocket adapter for real-time events
  app.useWebSocketAdapter(new IoAdapter(app));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`gateway-service running on port ${port}`, 'Bootstrap');
  Logger.log(`WebSocket events available at ws://localhost:${port}/ws/events`, 'Bootstrap');
  Logger.log(`Integration API at http://localhost:${port}/api/v1/gateway/*`, 'Bootstrap');
}
bootstrap();
