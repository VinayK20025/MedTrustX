'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ClaimsQueuePanel } from '../components/ClaimsQueuePanel';
import { ClaimWorkspacePanel } from '../components/ClaimWorkspacePanel';
import { FollowUpDenialPanel } from '../components/FollowUpDenialPanel';
import { useClaimsDashboard } from '../hooks/useClaimsAnalytics';
import type { ClaimsFilters } from '../services/claims.api';
import type { ClaimsKPI } from '../types/claims.types';
import { Landmark, AlertTriangle } from 'lucide-react';

function ClmKPICard({ kpi }: { kpi: ClaimsKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  const fmtVal = kpi.format === 'currency' ? `₹${(Number(kpi.value) / 1000).toFixed(0)}K` : kpi.value.toLocaleString();
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{fmtVal}</p>
    </div>
  );
}

export function ClaimsDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<ClaimsFilters>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data, isLoading } = useClaimsDashboard(filters);

  useEffect(() => { setPageMeta('Claims Coordinator', 'Revenue recovery — lifecycle tracking, follow-ups, and denial management'); }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedClaim = d.claims.find(c => c.id === selectedId);

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Claims Recovery' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/25">
          <Landmark className="w-3.5 h-3.5" /> RECOVERY ENGINE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <ClmKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px]">
          <ClaimsQueuePanel claims={d.claims} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-6 h-[650px]">
          <ClaimWorkspacePanel claim={selectedClaim} />
        </div>
        <div className="xl:col-span-3 h-[650px]">
          <FollowUpDenialPanel followUps={d.followUps} />
        </div>
      </div>
    </div>
  );
}
