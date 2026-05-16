'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { RiskListPanel } from '../components/RiskListPanel';
import { RiskWorkspace } from '../components/RiskWorkspace';
import { useLegalRiskDashboard } from '../hooks/useLegalRiskAnalytics';
import type { LegalRiskKPI } from '../types/legal-risk.types';
import { TrendingUp, TrendingDown, Minus, ShieldAlert, Crosshair } from 'lucide-react';

function RiskKPICard({ kpi }: { kpi: LegalRiskKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20 bg-success/[0.02]', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  const trendColor = kpi.trend === 'up' && kpi.status === 'success' ? 'text-success-light' : 
                     kpi.trend === 'up' && kpi.status !== 'success' ? 'text-emergency-light' : 
                     kpi.trend === 'down' && kpi.status === 'success' ? 'text-success-light' :
                     kpi.trend === 'down' && kpi.status !== 'success' ? 'text-warning-light' : 'text-gray-500';

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col justify-between shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={cn('text-3xl font-black font-mono', vc[kpi.status])}>{kpi.value}</p>
        <div className={cn('flex items-center gap-1 text-[11px] font-bold', trendColor)}>
          <TrendIcon className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

export function LegalRiskDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useLegalRiskDashboard({});
  const [selectedRiskId, setSelectedRiskId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Legal Risk Manager', 'Proactive risk intelligence, exposure quantification, and litigation prevention');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.risks && !selectedRiskId) {
      if (data.data.risks.length > 0) setSelectedRiskId(data.data.risks[0].id);
    }
  }, [data, selectedRiskId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const criticalRisks = d.risks.filter(r => r.severity === 'Critical');
  const selectedRisk = d.risks.find(r => r.id === selectedRiskId);

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {criticalRisks.length > 0 && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">CRITICAL RISK EXPOSURE DETECTED</span>
            <p className="text-[11px] text-red-300 mt-0.5">{criticalRisks.length} active risks have reached critical severity. Immediate mitigation implementation is required to prevent litigation.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Legal & Compliance' }, { label: 'Risk Intelligence Command' }]} />
        <div className="text-[12px] font-bold text-orange-400 flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/25">
          <Crosshair className="w-4 h-4" /> Proactive Mitigation Mode
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <RiskKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <RiskListPanel risks={d.risks} selectedId={selectedRiskId} onSelect={setSelectedRiskId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <RiskWorkspace risk={selectedRisk} mitigations={d.mitigations} incidents={d.incidents} />
        </div>
      </div>
    </div>
  );
}
