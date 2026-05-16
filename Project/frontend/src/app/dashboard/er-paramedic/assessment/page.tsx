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
        <Breadcrumbs items={[{ label: 'ER Paramedic' }, { label: 'Assessment' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-5 h-[700px]">
            <EmergencyCasePanel code={dashboard?.activeCode ?? null} />
          </div>
          <Card className="xl:col-span-7 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Assessment Checklist</h3>
                <p className="text-xs text-gray-400 mt-0.5">Live protocol and case readiness indicators</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {dashboard?.protocolSteps.map((step) => (
                <div key={step.id} className={`rounded-lg border p-3 ${step.isCompleted ? 'border-success/20 bg-success/5' : 'border-white/[0.08] bg-surface-dark'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white font-semibold">{step.action}</p>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">{step.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{step.isCompleted ? 'Completed' : 'Awaiting completion'}</p>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Log entries</p>
                  <p className="text-2xl font-bold text-white mt-1">{dashboard?.logs.length ?? 0}</p>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Rhythm</p>
                  <p className="text-2xl font-bold text-white mt-1">{dashboard?.vitals?.rhythm ?? '—'}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
