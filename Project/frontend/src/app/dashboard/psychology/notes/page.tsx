'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PsychologyNotesPanel, usePsychologyDashboard } from '@/modules/psychology';
import { Skeleton } from '@/components/ui/Spinner';

export default function PsychologyNotesPage() {
  const { data, isLoading } = usePsychologyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Mental Health' }, { label: 'SOAP Notes' }]} />
      <PsychologyNotesPanel notes={data?.data?.recentNotes ?? []} />
    </div>
  );
}
