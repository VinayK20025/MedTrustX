'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SyncLogsPanel } from '@/modules/edge-connectivity';

export default function EdgeSyncLogsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Edge Connectivity' }, { label: 'Data Sync Logs' }]} />
      <SyncLogsPanel />
    </div>
  );
}
