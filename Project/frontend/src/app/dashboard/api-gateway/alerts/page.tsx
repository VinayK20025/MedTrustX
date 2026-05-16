'use client';

import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useGatewayDashboard, useAcknowledgeGatewayAlert } from '@/modules/api-gateway';

const GATEWAY_ROLES = ['api_gateway_admin', 'super_admin', 'devops', 'security_engineer'];

export default function ApiGatewayAlertsPage() {
  const { data, isLoading } = useGatewayDashboard();
  const ackAlert = useAcknowledgeGatewayAlert();
  const alerts = data?.data.alerts || [];

  return (
    <RoleGuard roles={GATEWAY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'API Gateway' }, { label: 'Alerts' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">Active Alerts</h3>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">{alert.severity}</span>
                      <span className="text-xs text-gray-400">{alert.apiName}</span>
                      <span className="text-xs text-gray-400">{alert.type}</span>
                      <span className="text-xs text-gray-400">{alert.status}</span>
                    </div>
                    <div className="text-white font-medium">{alert.title}</div>
                    <div className="text-xs text-gray-400">{alert.details}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="px-2 py-1 rounded bg-emerald-600 text-xs text-white font-bold hover:bg-emerald-700"
                        disabled={alert.status !== 'Firing'}
                        onClick={() => ackAlert.mutate({ id: alert.id })}
                      >
                        Acknowledge
                      </button>
                      <span className="text-xs text-gray-500">Fired: {new Date(alert.firedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No active alerts</p>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
