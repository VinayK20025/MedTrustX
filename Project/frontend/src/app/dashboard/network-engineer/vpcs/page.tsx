'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NetworkTopologyPanel, useNetworkDashboard } from '@/modules/network-engineer';
import { Skeleton } from '@/components/ui/Spinner';

export default function NetworkVpcsPage() {
  const { data, isLoading } = useNetworkDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure Security' }, { label: 'VPC Topology' }]} />
      <NetworkTopologyPanel vpcs={data?.data?.vpcs ?? []} subnets={data?.data?.subnets ?? []} />
    </div>
  );
}
