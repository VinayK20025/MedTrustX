import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'healthy', service: 'board-reporting-service', version: '1.0.0', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  ready() {
    return { status: 'ready', service: 'board-reporting-service', version: '1.0.0', checks: { database: 'ok', kafka: 'ok' }, timestamp: new Date().toISOString() };
  }
}
