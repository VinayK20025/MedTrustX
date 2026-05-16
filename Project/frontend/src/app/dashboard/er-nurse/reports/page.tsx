'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseReportsPanel } from '@/modules/nurse';

const ER_NURSE_ROLES = ['er_nurse', 'nurse', 'nurse_manager', 'hospital_admin', 'super_admin'];

export default function NurseReportsPanelRoute() {
  return (
    <RoleGuard roles={ER_NURSE_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Nurse' }, { label: 'Reports' }]} />
        <NurseReportsPanel roleLabel="ER Nurse" />
      </div>
    </RoleGuard>
  );
}
