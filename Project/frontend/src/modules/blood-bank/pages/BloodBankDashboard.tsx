'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { InventoryPanel } from '../components/InventoryPanel';
import { BloodBankWorkspace } from '../components/BloodBankWorkspace';
import { useBloodBankDashboard } from '../hooks/useBloodBankAnalytics';
import type { BloodBankKPI } from '../types/blood-bank.types';
import { Droplets, AlertTriangle } from 'lucide-react';

function BbKPICard({ kpi }: { kpi: BloodBankKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20 bg-success/[0.02]', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col justify-between shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={cn('text-3xl font-black font-mono', vc[kpi.status])}>{kpi.value}</p>
      </div>
    </div>
  );
}

export function BloodBankDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});

  useEffect(() => {
    setPageMeta('Blood Bank Officer', 'Blood inventory management, screening, crossmatch safety, and transfusion traceability');
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const criticalGroups = d.stock.filter(s => s.status === 'Critical');
  const reactiveUnits = d.units.filter(u => u.screeningResult === 'Reactive' && u.status !== 'Discarded');

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {(criticalGroups.length > 0 || reactiveUnits.length > 0) && (
        <div className="flex gap-3 flex-wrap">
          {criticalGroups.length > 0 && (
            <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
              <AlertTriangle className="w-4 h-4 text-emergency-light shrink-0 animate-pulse" />
              <div>
                <span className="text-[11px] font-black text-emergency-light uppercase tracking-widest">CRITICAL BLOOD SHORTAGE</span>
                <p className="text-[10px] text-red-200 mt-0.5">{criticalGroups.map(g => g.group).join(', ')} below minimum threshold. Activate emergency donor drive.</p>
              </div>
            </div>
          )}
          {reactiveUnits.length > 0 && (
            <div className="bg-red-600/20 border border-red-600/40 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">{reactiveUnits.length} REACTIVE UNIT(S)</span>
                <p className="text-[10px] text-red-200 mt-0.5">Screening positive — must be quarantined and discarded immediately.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Laboratory Services' }, { label: 'Blood Bank' }]} />
        <div className="text-[12px] font-bold text-red-400 flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/25">
          <Droplets className="w-4 h-4" /> Transfusion Services Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <BbKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <InventoryPanel stock={d.stock} />
        </div>
        <div className="xl:col-span-8 h-full">
          <BloodBankWorkspace units={d.units} crossmatches={d.crossmatches} />
        </div>
      </div>
    </div>
  );
}
