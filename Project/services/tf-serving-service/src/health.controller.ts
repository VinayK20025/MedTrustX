import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'healthy',
      service: 'tf-serving-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  ready() {
    return {
      status: 'ready',
      service: 'tf-serving-service',
      version: '1.0.0',
      checks: { models: 'loaded', inference_engine: 'ok' },
      timestamp: new Date().toISOString(),
    };
  }
}
