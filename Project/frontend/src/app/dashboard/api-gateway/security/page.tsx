'use client';

import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useGatewayDashboard } from '@/modules/api-gateway';

const GATEWAY_ROLES = ['api_gateway_admin', 'super_admin', 'security_engineer'];

export default function ApiGatewaySecurityPage() {
  const { data, isLoading } = useGatewayDashboard();
  const policies = data?.data.securityPolicies || [];

  return (
    <RoleGuard roles={GATEWAY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'API Gateway' }, { label: 'Security' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">Security Enforcement</h3>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : policies.length > 0 ? (
              <div className="space-y-2">
                {policies.map(policy => (
                  <div key={policy.id} className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400">{policy.type}</span>
                      <span className="text-xs text-gray-400">{policy.status}</span>
                      <span className="text-xs text-gray-400">{policy.scope}</span>
                    </div>
                    <div className="text-white font-medium">{policy.name}</div>
                    <div className="text-xs text-gray-400">Blocked Today: {policy.blockedToday}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No security policies found</p>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
