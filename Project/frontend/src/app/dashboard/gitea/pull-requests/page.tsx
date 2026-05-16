'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PullRequestsPanel } from '@/modules/gitea';

export default function GiteaPRsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Gitea Source Control' }, { label: 'Pull Requests' }]} />
      <PullRequestsPanel />
    </div>
  );
}
