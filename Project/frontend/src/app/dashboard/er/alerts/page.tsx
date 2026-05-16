'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ERAlertsPanel, useERDashboard } from '@/modules/er';

const ER_ROLES = ['er_physician', 'emergency_physician', 'hospital_admin', 'super_admin'];

export default function Alerts() {
  const { data } = useERDashboard({ view: 'all' });
  const alerts = data?.data?.alerts ?? [];

  return (
    <RoleGuard roles={ER_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Physician' }, { label: 'Alerts' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-6 h-[500px]">
            <ERAlertsPanel alerts={alerts} />
          </div>
          <Card className="xl:col-span-6 border-emergency/20 shadow-glass bg-emergency/5">
            <CardHeader className="border-b border-emergency/10 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-emergency-light tracking-wide">Critical Alert History</h3>
                <p className="text-xs text-gray-400 mt-0.5">Code blues, trauma alerts, and vitals deterioration</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-lg border border-emergency/20 bg-surface-dark p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white font-semibold">{alert.type.replace('_', ' ')}</p>
                    <span className="text-xs text-gray-400 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                  {alert.location && <p className="text-xs text-gray-500 mt-1">Location: {alert.location}</p>}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
