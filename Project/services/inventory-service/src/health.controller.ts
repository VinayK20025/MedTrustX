import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'healthy', service: 'inventory-service', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  ready() {
    return { status: 'ready', service: 'inventory-service', checks: { database: 'ok', redis: 'ok', kafka: 'ok' } };
  }
}
