'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SpeechProgressPanel, useSpeechDashboard } from '@/modules/speech-therapy';
import { Skeleton } from '@/components/ui/Spinner';

export default function SpeechProgressPage() {
  const { data, isLoading } = useSpeechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Speech Therapy' }, { label: 'Progress Tracking' }]} />
      <SpeechProgressPanel metrics={data?.data?.progressMetrics ?? []} />
    </div>
  );
}
