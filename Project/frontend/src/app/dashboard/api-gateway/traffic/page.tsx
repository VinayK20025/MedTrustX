'use client';

import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useGatewayDashboard } from '@/modules/api-gateway';

const GATEWAY_ROLES = ['api_gateway_admin', 'super_admin', 'devops', 'network_engineer'];

export default function ApiGatewayTrafficPage() {
  const { data, isLoading } = useGatewayDashboard();
  const timeline = data?.data.trafficTimeline || [];

  return (
    <RoleGuard roles={GATEWAY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'API Gateway' }, { label: 'Traffic' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">Traffic Timeline</h3>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : timeline.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-2 py-1 text-left text-gray-400">Time</th>
                      <th className="px-2 py-1 text-left text-gray-400">Requests</th>
                      <th className="px-2 py-1 text-left text-gray-400">Errors</th>
                      <th className="px-2 py-1 text-left text-gray-400">Latency (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map((point, idx) => (
                      <tr key={idx} className="border-b border-white/[0.03]">
                        <td className="px-2 py-1">{new Date(point.time).toLocaleTimeString()}</td>
                        <td className="px-2 py-1">{point.requests}</td>
                        <td className="px-2 py-1">{point.errors}</td>
                        <td className="px-2 py-1">{point.latencyMs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No traffic data</p>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
