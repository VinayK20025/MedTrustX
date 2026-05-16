'use client';

import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useGatewayDashboard } from '@/modules/api-gateway';

const GATEWAY_ROLES = ['api_gateway_admin', 'super_admin', 'devops'];

export default function ApiGatewayRoutingPage() {
  const { data, isLoading } = useGatewayDashboard();
  const routes = data?.data.routes || [];

  return (
    <RoleGuard roles={GATEWAY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'API Gateway' }, { label: 'Routing' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">API Routing Table</h3>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : routes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-2 py-1 text-left text-gray-400">API</th>
                      <th className="px-2 py-1 text-left text-gray-400">Path</th>
                      <th className="px-2 py-1 text-left text-gray-400">Method</th>
                      <th className="px-2 py-1 text-left text-gray-400">Destination</th>
                      <th className="px-2 py-1 text-left text-gray-400">LB</th>
                      <th className="px-2 py-1 text-left text-gray-400">Health</th>
                      <th className="px-2 py-1 text-left text-gray-400">Calls Today</th>
                      <th className="px-2 py-1 text-left text-gray-400">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map(route => (
                      <tr key={route.id} className="border-b border-white/[0.03]">
                        <td className="px-2 py-1">{route.apiId}</td>
                        <td className="px-2 py-1">{route.path}</td>
                        <td className="px-2 py-1">{route.method}</td>
                        <td className="px-2 py-1">{route.destination}</td>
                        <td className="px-2 py-1">{route.loadBalancer}</td>
                        <td className="px-2 py-1">{route.healthStatus}</td>
                        <td className="px-2 py-1">{route.callsToday}</td>
                        <td className="px-2 py-1">{route.avgLatencyMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No routes found</p>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
