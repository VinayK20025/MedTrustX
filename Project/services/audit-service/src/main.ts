import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug'] });
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log('audit-service running on port ' + port, 'Bootstrap');
}
bootstrap();
