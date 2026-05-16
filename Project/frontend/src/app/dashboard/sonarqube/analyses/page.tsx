'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AnalysesPanel } from '@/modules/sonarqube';

export default function SonarAnalysesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'SonarQube Quality Service' }, { label: 'Analyses' }]} />
      <AnalysesPanel />
    </div>
  );
}
