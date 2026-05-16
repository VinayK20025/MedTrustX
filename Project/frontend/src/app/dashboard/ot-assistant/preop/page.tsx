'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTAssistantChecklistPanel, useOTAssistantDashboard } from '@/modules/ot-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function OTAssistantPreOpPage() {
  const { data, isLoading } = useOTAssistantDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Pre-Op Setup' }]} />
      <OTAssistantChecklistPanel checklist={data?.data?.setupChecklist ?? []} />
    </div>
  );
}
