'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseProceduresPanel } from '@/modules/nurse';

export default function NurseProceduresPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Staff Nurse' }, { label: 'Procedures' }]} />
      <NurseProceduresPanel />
    </div>
  );
}
