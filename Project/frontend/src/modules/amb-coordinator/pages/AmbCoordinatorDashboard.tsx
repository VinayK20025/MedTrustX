'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { IncomingCallsPanel } from '../components/IncomingCallsPanel';
import { LiveDispatchMap } from '../components/LiveDispatchMap';
import { FleetStatusPanel } from '../components/FleetStatusPanel';
import { useAmbCoordinatorDashboard } from '../hooks/useAmbCoordinatorAnalytics';
import type { AmbCoordinatorKPI } from '../types/amb-coordinator.types';
import { RadioReceiver, AlertTriangle } from 'lucide-react';

function CoordKPICard({ kpi }: { kpi: AmbCoordinatorKPI }) {
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

export function AmbCoordinatorDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useAmbCoordinatorDashboard({});
  const [selectedCallId, setSelectedCallId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Ambulance Coordinator', 'EMS control room, live fleet tracking, and auto-dispatch');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.incomingCalls && !selectedCallId) {
      const active = data.data.incomingCalls.find(c => c.status === 'Pending Dispatch');
      setSelectedCallId(active ? active.id : data.data.incomingCalls[0]?.id);
    }
  }, [data, selectedCallId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedCall = d.incomingCalls.find(c => c.id === selectedCallId) || null;
  const criticalCalls = d.incomingCalls.filter(c => c.priority === 'Critical' && c.status === 'Pending Dispatch').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {criticalCalls > 0 && (
        <div className="bg-emergency/20 border border-emergency/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-emergency-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-emergency-light uppercase tracking-widest">CRITICAL DISPATCH PENDING</span>
            <p className="text-[11px] text-red-200 mt-0.5">{criticalCalls} critical emergency calls waiting in queue. Dispatch nearest available ALS unit immediately.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Emergency Operations' }, { label: 'EMS Command Center' }]} />
        <div className="text-[12px] font-bold text-blue-400 flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <RadioReceiver className="w-4 h-4" /> Regional GPS Tracking Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <CoordKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-3 h-full">
          <IncomingCallsPanel calls={d.incomingCalls} selectedId={selectedCallId} onSelect={setSelectedCallId} />
        </div>
        <div className="xl:col-span-6 h-full">
          <LiveDispatchMap call={selectedCall} fleet={d.fleet} />
        </div>
        <div className="xl:col-span-3 h-full">
          <FleetStatusPanel fleet={d.fleet} />
        </div>
      </div>
    </div>
  );
}
