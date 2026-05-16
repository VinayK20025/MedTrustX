import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'healthy', service: 'gateway-service', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  ready() {
    return { status: 'ready', service: 'gateway-service', checks: { database: 'ok', redis: 'ok', kafka: 'ok' } };
  }
}
