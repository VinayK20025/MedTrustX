'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmergencyVitalsPanel, useERParamedicDashboard } from '@/modules/er-paramedic';

const PARAMEDIC_ROLES = ['paramedic', 'er_paramedic', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data } = useERParamedicDashboard({});
  const dashboard = data?.data;

  return (
    <RoleGuard roles={PARAMEDIC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Paramedic' }, { label: 'Vitals' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 h-[700px]">
            <EmergencyVitalsPanel vitals={dashboard?.vitals ?? null} logs={dashboard?.logs ?? []} />
          </div>
          <Card className="xl:col-span-4 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Vitals Snapshot</h3>
                <p className="text-xs text-gray-400 mt-0.5">Current physiological readout for the active code</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Heart rate</p>
                <p className="text-2xl font-bold text-white mt-1">{dashboard?.vitals?.hr ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Blood pressure</p>
                <p className="text-2xl font-bold text-white mt-1">{dashboard?.vitals?.bp ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">SpO2</p>
                <p className="text-2xl font-bold text-white mt-1">{dashboard?.vitals?.spo2 ?? '—'}%</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
