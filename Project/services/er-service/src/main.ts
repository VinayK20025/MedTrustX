import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'development' ? '*' : [],
    credentials: true,
    exposedHeaders: ['X-Tenant-ID', 'X-Request-ID'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('MedTrustX Emergency (ER) Service')
    .setDescription(
      'Tier-0 Life-Critical Service — manages emergency care workflow including ' +
      'patient triage, severity-based prioritization (ESI 1-5), real-time queue ' +
      'management, and staff resource allocation.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Emergency Cases', 'Core ER case CRUD and lifecycle management')
    .addTag('Triage', 'Clinical triage with ESI priority scoring')
    .addTag('Assignments', 'Staff assignment to emergency cases')
    .addTag('ER Queue', 'Real-time priority queue')
    .addTag('ER Events', 'Immutable case event timeline / audit trail')
    .addTag('Health', 'Liveness and readiness probes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/swagger', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `er-service running on port ${port} | Swagger: http://localhost:${port}/api/v1/swagger`,
    'Bootstrap',
  );
}
bootstrap();
