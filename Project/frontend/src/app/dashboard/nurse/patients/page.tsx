'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NursePatientWorklist } from '@/modules/nurse';

export default function NursePatientWorklistRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Staff Nurse' }, { label: 'My Patients' }]} />
      <NursePatientWorklist roleLabel="Staff Nurse" />
    </div>
  );
}
