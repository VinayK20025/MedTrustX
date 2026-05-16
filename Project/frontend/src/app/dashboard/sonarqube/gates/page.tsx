'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { QualityGatesPanel } from '@/modules/sonarqube';

export default function SonarGatesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'SonarQube Quality Service' }, { label: 'Quality Gates' }]} />
      <QualityGatesPanel />
    </div>
  );
}
