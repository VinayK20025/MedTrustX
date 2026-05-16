'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProjectsPanel } from '@/modules/sonarqube';

export default function SonarProjectsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'SonarQube Quality Service' }, { label: 'Projects' }]} />
      <ProjectsPanel />
    </div>
  );
}
