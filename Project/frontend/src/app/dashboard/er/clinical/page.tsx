'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalDashboard } from '@/modules/clinical';

const ER_ROLES = ['er_physician', 'emergency_physician', 'hospital_admin', 'super_admin'];

export default function QuickNotes() {
  return (
    <RoleGuard roles={ER_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Physician' }, { label: 'Quick Notes' }]} />
        <ClinicalDashboard roleTitle="ER Physician" />
      </div>
    </RoleGuard>
  );
}
