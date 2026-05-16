'use client';

import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useGatewayDashboard } from '@/modules/api-gateway';

const GATEWAY_ROLES = ['api_gateway_admin', 'super_admin', 'devops', 'data_analyst'];

export default function ApiGatewayReportsPage() {
  const { data, isLoading } = useGatewayDashboard();
  const metrics = data?.data.metrics;

  return (
    <RoleGuard roles={GATEWAY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'API Gateway' }, { label: 'Reports' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">Gateway Metrics</h3>
            {isLoading || !metrics ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Requests Today</p>
                  <p className="text-lg font-bold text-white">{metrics.requestsToday.toLocaleString()}</p>
                </div>
                <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Error Rate</p>
                  <p className="text-lg font-bold text-rose-400">{metrics.errorRate}%</p>
                </div>
                <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Latency</p>
                  <p className="text-lg font-bold text-amber-400">{metrics.avgLatencyMs} ms</p>
                </div>
                <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Blocked Requests</p>
                  <p className="text-lg font-bold text-rose-400">{metrics.blockedRequests}</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
