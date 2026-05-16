'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CoderWorkspacePanel, useCoderDashboard } from '@/modules/medical-coder';
import { Skeleton } from '@/components/ui/Spinner';

export default function CoderWorkspacePage() {
  const { data, isLoading } = useCoderDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Medical Coding' }, { label: 'Coding Workspace' }]} />
      <CoderWorkspacePanel active={data?.data?.activeCoding} suggestions={data?.data?.suggestions ?? []} />
    </div>
  );
}
