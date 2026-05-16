import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health.controller';
import { IntegrationController } from './integration.controller';
import { EventGateway } from './event.gateway';
import { KafkaConsumerService } from './kafka-consumer.service';
import { DatabaseModule } from './database/database.module';
import { SeederModule } from './database/seeders/seeder.module';
import { AuthMiddleware } from './shared/auth.middleware';
import { TenantMiddleware } from './shared/tenant.middleware';
import { ZtaGuard } from './shared/zta.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, SeederModule],
  controllers: [HealthController, IntegrationController],
  providers: [
    EventGateway, 
    KafkaConsumerService,
    {
      provide: APP_GUARD,
      useClass: ZtaGuard,
    }
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
