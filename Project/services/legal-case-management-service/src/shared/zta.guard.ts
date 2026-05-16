import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZtaGuard implements CanActivate {
  private readonly logger = new Logger(ZtaGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const skipPaths = ['/health', '/ready', '/metrics'];
    if (skipPaths.includes(request.path)) return true;
    const opaUrl = process.env.OPA_URL || 'http://opa:8181';
    const opaInput = { input: { role: request.headers['x-user-role'] || 'anonymous', action: this.methodToAction(request.method), resource: 'legal_resource', user_tenant_id: request.tenantId || '', resource_tenant_id: request.tenantId || '', ip_trusted: true, device_compliant: request.headers['x-device-compliant'] === 'true', device_registered: request.headers['x-device-registered'] === 'true', device_trust_score: parseFloat(request.headers['x-device-trust-score'] || '0.8'), mfa_verified: request.headers['x-mfa-verified'] === 'true', session_active: true, token_expired: false, anomaly_score: 0.1, geo_allowed: true, emergency: request.headers['x-emergency'] === 'true' } };
    try {
      const response = await axios.post(`${opaUrl}/v1/data/medtrust/authz/zta/decision`, opaInput, { timeout: 2000 });
      const decision = response.data.result || {};
      if (!decision.allow) {
        const reason = decision.reason || 'access_denied';
        if (decision.action === 'mfa') throw new ForbiddenException({ error: 'step_up_required', message: 'MFA verification required' });
        throw new ForbiddenException({ error: 'access_denied', reason });
      }
      return true;
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      this.logger.error(`OPA error: ${error.message}`);
      if (process.env.ENVIRONMENT !== 'development') throw new ForbiddenException('policy_engine_unavailable');
      return true;
    }
  }

  private methodToAction(method: string): string {
    const map: Record<string, string> = { GET: 'read', POST: 'write', PUT: 'update', PATCH: 'update', DELETE: 'delete' };
    return map[method] || 'read';
  }
}
