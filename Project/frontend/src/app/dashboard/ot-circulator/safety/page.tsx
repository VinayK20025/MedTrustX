'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CirculatorSafetyPanel, useCirculatorDashboard } from '@/modules/ot-circulator';
import { Skeleton } from '@/components/ui/Spinner';

export default function CirculatorSafetyPage() {
  const { data, isLoading } = useCirculatorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Safety Protocols' }]} />
      <CirculatorSafetyPanel checklist={data?.data?.safetyChecklist ?? []} />
    </div>
  );
}
