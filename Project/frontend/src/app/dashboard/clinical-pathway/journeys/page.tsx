'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PatientJourneysPanel } from '@/modules/clinical-pathway';

export default function PatientJourneysRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Pathway Intelligence' }, { label: 'Patient Journeys' }]} />
      <PatientJourneysPanel />
    </div>
  );
}
