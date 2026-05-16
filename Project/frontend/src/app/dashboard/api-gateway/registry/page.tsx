'use client';

import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useGatewayDashboard } from '@/modules/api-gateway';

const GATEWAY_ROLES = ['api_gateway_admin', 'super_admin', 'devops'];

export default function ApiGatewayRegistryPage() {
  const { data, isLoading } = useGatewayDashboard();
  const apis = data?.data.apis || [];

  return (
    <RoleGuard roles={GATEWAY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'API Gateway' }, { label: 'Registry' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">API Registry</h3>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : apis.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-2 py-1 text-left text-gray-400">API Name</th>
                      <th className="px-2 py-1 text-left text-gray-400">Base Path</th>
                      <th className="px-2 py-1 text-left text-gray-400">Status</th>
                      <th className="px-2 py-1 text-left text-gray-400">Auth</th>
                      <th className="px-2 py-1 text-left text-gray-400">Requests Today</th>
                      <th className="px-2 py-1 text-left text-gray-400">Error Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apis.map(api => (
                      <tr key={api.id} className="border-b border-white/[0.03]">
                        <td className="px-2 py-1">{api.name}</td>
                        <td className="px-2 py-1">{api.basePath}</td>
                        <td className="px-2 py-1">{api.status}</td>
                        <td className="px-2 py-1">{api.authMethod}</td>
                        <td className="px-2 py-1">{api.requestsToday}</td>
                        <td className="px-2 py-1">{api.errorRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No APIs registered</p>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
