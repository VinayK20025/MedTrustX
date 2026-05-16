'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SpeechTherapyPanel, useSpeechDashboard } from '@/modules/speech-therapy';
import { Skeleton } from '@/components/ui/Spinner';

export default function SpeechTherapyPage() {
  const { data, isLoading } = useSpeechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Speech Therapy' }, { label: 'Therapy Plans' }]} />
      <SpeechTherapyPanel plan={data?.data?.activePlan} />
    </div>
  );
}
