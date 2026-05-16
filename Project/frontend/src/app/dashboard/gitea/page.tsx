'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GiteaDashboard } from '@/modules/gitea';

export default function GiteaRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Gitea Source Control' }]} />
      <GiteaDashboard />
    </div>
  );
}
