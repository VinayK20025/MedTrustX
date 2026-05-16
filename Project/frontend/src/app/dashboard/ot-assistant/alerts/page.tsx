'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTAssistantAlertPanel, useOTAssistantDashboard } from '@/modules/ot-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function OTAssistantAlertsPage() {
  const { data, isLoading } = useOTAssistantDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Alerts' }]} />
      <OTAssistantAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
