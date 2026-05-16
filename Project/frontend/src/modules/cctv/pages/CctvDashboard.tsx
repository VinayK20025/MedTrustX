'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { CameraListPanel } from '../components/CameraListPanel';
import { LiveFeedGrid } from '../components/LiveFeedGrid';
import { SurveillanceAlertsPanel } from '../components/SurveillanceAlertsPanel';
import { useCctvDashboard } from '../hooks/useCctvAnalytics';
import type { SurveillanceKPI } from '../types/cctv.types';
import { AlertTriangle, Camera, Radio } from 'lucide-react';

function CctvKPICard({ kpi }: { kpi: SurveillanceKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3" />}{kpi.label}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value}</p>
    </div>
  );
}

export function CctvDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useCctvDashboard({});
  const [selectedCamId, setSelectedCamId] = useState<string | undefined>();
  const [focusedCamId, setFocusedCamId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Surveillance Operator', 'CCTV command — live monitoring, AI-assisted detection, and incident response');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1900px]">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-[640px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const hasHighAlert = d.alerts.some(a => a.severity === 'High' && a.status !== 'Closed');

  return (
    <div className="space-y-4 animate-fade-in max-w-[1900px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'CCTV Command' }]} />
        <div className="flex items-center gap-3">
          {hasHighAlert && (
            <span className="text-[10px] bg-emergency/20 text-emergency-light px-3 py-1.5 rounded-lg border border-emergency/30 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> SURVEILLANCE ALERT ACTIVE
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/25">
            <Radio className="w-3.5 h-3.5" /> LIVE MONITORING
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <CctvKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main 3-panel layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Camera list — narrow left column */}
        <div className="xl:col-span-2 h-[660px]">
          <CameraListPanel cameras={d.cameras} selectedId={selectedCamId} onSelect={id => { setSelectedCamId(id); setFocusedCamId(id); }} />
        </div>
        {/* Live feed grid — wide center */}
        <div className="xl:col-span-7 h-[660px]">
          <LiveFeedGrid cameras={d.cameras} focusedId={focusedCamId} onFocus={setFocusedCamId} />
        </div>
        {/* Alerts panel — right column */}
        <div className="xl:col-span-3 h-[660px]">
          <SurveillanceAlertsPanel alerts={d.alerts} />
        </div>
      </div>
    </div>
  );
}
