'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useERParamedicDashboard } from '@/modules/er-paramedic';

const PARAMEDIC_ROLES = ['paramedic', 'er_paramedic', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data } = useERParamedicDashboard({});
  const dashboard = data?.data;

  return (
    <RoleGuard roles={PARAMEDIC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Paramedic' }, { label: 'Reports' }]} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(dashboard?.kpis ?? []).map((kpi) => (
            <Card key={kpi.id} className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardBody className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{kpi.label}</p>
                <p className="text-3xl font-black text-white mt-2">{kpi.value}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader className="border-b border-white/[0.04] px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">Code Event Summary</h3>
              <p className="text-xs text-gray-400 mt-0.5">Recent response activity and protocol completion snapshot</p>
            </div>
          </CardHeader>
          <CardBody className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Completed steps</p>
              <p className="text-2xl font-bold text-white mt-1">{dashboard?.protocolSteps.filter((step) => step.isCompleted).length ?? 0}</p>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Event logs</p>
              <p className="text-2xl font-bold text-white mt-1">{dashboard?.logs.length ?? 0}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
