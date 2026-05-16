'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { AccessPanel } from '@/modules/ciso/components/AccessPanel';
import { useCisoDashboard } from '@/modules/ciso/hooks/useCisoAnalytics';
import type { CisoFilters } from '@/modules/ciso/services/ciso.api';
import { RoleGuard } from '@/components/guards/AuthGuard';


export default function CisoIamPage() {
  const [filters] = useState<CisoFilters>({ timeWindow: '24h', severityFilter: 'all' });
  const { data, isLoading } = useCisoDashboard(filters);

  return (
    <RoleGuard roles={['ciso', 'enterprise-security', 'security-root', 'super_admin']} requireAll={false}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CISO' }, { label: 'Identity Access Management' }]} />
      
      {isLoading ? (
        <Skeleton className="h-[600px] w-full rounded-xl" />
      ) : data?.data ? (
        <div className="h-[700px]">
          <AccessPanel logs={data.data.accessLogs} />
        </div>
      ) : (
        <div className="text-gray-500 py-20 text-center">No data available</div>
      )}
    </div>
    </RoleGuard>
  );
}
