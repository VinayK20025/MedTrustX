'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SocialWorkResourcePanel, useSocialWorkDashboard } from '@/modules/social-work';
import { Skeleton } from '@/components/ui/Spinner';

export default function SocialWorkerResourcesPage() {
  const { data, isLoading } = useSocialWorkDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Social Work' }, { label: 'Community Resources' }]} />
      <SocialWorkResourcePanel plan={data?.data?.activePlan} directory={data?.data?.resourceDirectory ?? []} />
    </div>
  );
}
