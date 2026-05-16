'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { PamAccessPanel } from '../components/PamAccessPanel';
import { PamRequestPanel } from '../components/PamRequestPanel';
import { PamSessionPanel } from '../components/PamSessionPanel';
import { PamMonitoringPanel } from '../components/PamMonitoringPanel';
import { PamRecordingPanel } from '../components/PamRecordingPanel';
import { PamPolicyPanel } from '../components/PamPolicyPanel';
import { PamAlertPanel } from '../components/PamAlertPanel';
import { usePamDashboard } from '../hooks/usePamAnalytics';
import type { PAMFilters } from '../services/pam.api';
import type { PAMKPI } from '../types/pam.types';
import { ShieldAlert, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function PamKPICard({ kpi }: { kpi: PAMKPI }) {
  const router = useRouter();
  const statusColors: Record<string, string> = {
    success:  'border-success/20 hover:border-success/40',
    normal:   'border-white/[0.06] hover:border-white/[0.12]',
    warning:  'border-warning/20 hover:border-warning/40',
    critical: 'border-emergency/20 hover:border-emergency/40',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover',
      statusColors[kpi.status]
    )} onClick={() => kpi.actionUrl && router.push(kpi.actionUrl)}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        {kpi.trendDirection && (
          <div className={cn('flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded',
            kpi.trendDirection === 'up' ? 'text-success-light bg-success/10' :
            kpi.trendDirection === 'down' ? 'text-emergency-light bg-emergency/10' :
            'text-gray-500 bg-white/5'
          )}>
            {kpi.trendDirection === 'up' && <TrendingUp className="w-2.5 h-2.5" />}
            {kpi.trendDirection === 'down' && <TrendingDown className="w-2.5 h-2.5" />}
            {kpi.trend !== undefined && `${Math.abs(kpi.trend)}%`}
          </div>
        )}
      </div>
      <p className={cn('text-2xl font-black mt-2', valueColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
      {kpi.actionLabel && (
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

export function PamDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<PAMFilters>({ timeframe: 'today' });
  const { data, isLoading } = usePamDashboard(filters);

  useEffect(() => {
    setPageMeta('PAM Operator', 'Privileged Access Management, JIT Elevation & Live Monitoring');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'PAM Workspace' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-emergency-light bg-emergency/10 px-4 py-2 rounded-lg border border-emergency/25">
          <ShieldAlert className="w-3.5 h-3.5" />
          HIGH RISK CONTROL
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <PamKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Row 1: Live Monitoring & Active Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <PamMonitoringPanel activities={d.liveActivities} />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <PamSessionPanel sessions={d.sessions} />
        </div>
      </div>

      {/* Row 2: Requests & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <PamRequestPanel requests={d.requests} />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <PamAlertPanel alerts={d.alerts} />
        </div>
      </div>

      {/* Row 3: Vaulted Accounts, Policies, Recordings */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-4 h-[400px]">
          <PamAccessPanel accounts={d.accounts} />
        </div>
        <div className="xl:col-span-4 h-[400px]">
          <PamPolicyPanel policies={d.policies} />
        </div>
        <div className="xl:col-span-4 h-[400px]">
          <PamRecordingPanel recordings={d.recordings} />
        </div>
      </div>
    </div>
  );
}
