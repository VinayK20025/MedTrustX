'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SonarQubeDashboard } from '@/modules/sonarqube';

export default function SonarQubeRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'SonarQube Quality Service' }]} />
      <SonarQubeDashboard />
    </div>
  );
}
