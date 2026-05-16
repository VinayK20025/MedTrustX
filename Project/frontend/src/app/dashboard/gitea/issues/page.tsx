'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IssuesPanel } from '@/modules/gitea';

export default function GiteaIssuesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Gitea Source Control' }, { label: 'Issues' }]} />
      <IssuesPanel />
    </div>
  );
}
