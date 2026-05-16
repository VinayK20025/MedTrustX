'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NetworkZeroTrustPanel, useNetworkDashboard } from '@/modules/network-engineer';
import { Skeleton } from '@/components/ui/Spinner';

export default function NetworkZeroTrustPage() {
  const { data, isLoading } = useNetworkDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure Security' }, { label: 'Zero Trust Network Access' }]} />
      <NetworkZeroTrustPanel identities={data?.data?.zeroTrust ?? []} />
    </div>
  );
}
