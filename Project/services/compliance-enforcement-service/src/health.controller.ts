import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'healthy',
      service: 'compliance-enforcement-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  ready() {
    return {
      status: 'ready',
      service: 'compliance-enforcement-service',
      version: '1.0.0',
      checks: { database: 'ok', redis: 'ok', kafka: 'ok' },
      timestamp: new Date().toISOString(),
    };
  }
}
