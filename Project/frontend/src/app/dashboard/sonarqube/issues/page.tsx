'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CodeIssuesPanel } from '@/modules/sonarqube';

export default function SonarIssuesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'SonarQube Quality Service' }, { label: 'Code Issues' }]} />
      <CodeIssuesPanel />
    </div>
  );
}
