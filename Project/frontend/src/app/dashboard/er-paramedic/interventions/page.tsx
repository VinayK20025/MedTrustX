'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CodeResponseWorkspace, useERParamedicDashboard } from '@/modules/er-paramedic';

const PARAMEDIC_ROLES = ['paramedic', 'er_paramedic', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data } = useERParamedicDashboard({});

  return (
    <RoleGuard roles={PARAMEDIC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Paramedic' }, { label: 'Interventions' }]} />
        <div className="h-[760px]">
          <CodeResponseWorkspace protocols={data?.data?.protocolSteps ?? []} />
        </div>
      </div>
    </RoleGuard>
  );
}
