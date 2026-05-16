'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseAlertsSharedPanel } from '@/modules/nurse';

const ER_NURSE_ROLES = ['er_nurse', 'nurse', 'nurse_manager', 'hospital_admin', 'super_admin'];

export default function NurseAlertsSharedPanelRoute() {
  return (
    <RoleGuard roles={ER_NURSE_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Nurse' }, { label: 'Alerts' }]} />
        <NurseAlertsSharedPanel roleLabel="ER Nurse" />
      </div>
    </RoleGuard>
  );
}
