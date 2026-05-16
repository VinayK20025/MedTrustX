'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTAssistantPostOpPanel, useOTAssistantDashboard } from '@/modules/ot-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function OTAssistantPostOpPage() {
  const { data, isLoading } = useOTAssistantDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Post-Op Cleanup' }]} />
      <OTAssistantPostOpPanel tasks={data?.data?.cleanupTasks ?? []} />
    </div>
  );
}
