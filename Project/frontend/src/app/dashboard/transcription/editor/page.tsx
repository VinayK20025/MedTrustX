'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TranscriptionAudioEditor, useTranscriptionDashboard } from '@/modules/transcription';
import { Skeleton } from '@/components/ui/Spinner';

export default function TranscriptionEditorPage() {
  const { data, isLoading } = useTranscriptionDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Documentation' }, { label: 'Audio Editor' }]} />
      <TranscriptionAudioEditor active={data?.data?.activeEditor} />
    </div>
  );
}
