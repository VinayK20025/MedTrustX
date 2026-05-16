'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmergencyCasePanel, useERParamedicDashboard } from '@/modules/er-paramedic';

const PARAMEDIC_ROLES = ['paramedic', 'er_paramedic', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data } = useERParamedicDashboard({});
  const dashboard = data?.data;

  return (
    <RoleGuard roles={PARAMEDIC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Paramedic' }, { label: 'Cases' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-5 h-[650px]">
            <EmergencyCasePanel code={dashboard?.activeCode ?? null} />
          </div>
          <Card className="xl:col-span-7 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Active Case Timeline</h3>
                <p className="text-xs text-gray-400 mt-0.5">Recent code activity and response milestones</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {(dashboard?.logs ?? []).map((log) => (
                <div key={log.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(log.time).toLocaleTimeString()}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Event</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
