'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { HvacTaskQueue } from '../components/HvacTaskQueue';
import { HvacTaskWorkspace } from '../components/HvacTaskWorkspace';
import { HvacMonitoringPanel } from '../components/HvacMonitoringPanel';
import { useHvacDashboard } from '../hooks/useHvacAnalytics';
import type { HvacFilters } from '../services/hvac.api';
import type { HVACKPI } from '../types/hvac.types';
import { Wind, AlertTriangle, WifiOff } from 'lucide-react';

function HvacKPICard({ kpi }: { kpi: HVACKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function HvacDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<HvacFilters>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [isOnline, setIsOnline] = useState(true);
  const { data, isLoading } = useHvacDashboard(filters);

  useEffect(() => { 
    setPageMeta('HVAC Technician', 'Real-time environmental control for isolation rooms and operating theaters'); 
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px] p-2 md:p-0">
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedTask = d.tasks.find(t => t.id === selectedTaskId);
  const hasEmergency = d.tasks.some(t => t.isEmergency && t.status !== 'Resolved');

  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in max-w-[1800px] p-2 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Facility' }, { label: 'HVAC Control' }]} />
        <div className="flex items-center gap-3">
           {!isOnline && <span className="text-[10px] bg-warning/20 text-warning-light px-3 py-1.5 rounded-lg border border-warning/30 font-bold flex items-center gap-1"><WifiOff className="w-3 h-3" /> SENSOR DATA OFFLINE</span>}
           <div className={cn("flex items-center gap-2 text-[11px] font-bold px-4 py-2 rounded-lg border", hasEmergency ? "bg-emergency/20 border-emergency/30 text-emergency-light animate-pulse" : "bg-teal-500/10 border-teal-500/25 text-teal-400")}>
             <Wind className="w-3.5 h-3.5" /> {hasEmergency ? "CRITICAL PRESSURE LOSS" : "ENVIRONMENT STABLE"}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {d.kpis.map(kpi => <HvacKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[700px]">
        {/* On mobile, stack them. On desktop, layout normally */}
        <div className={cn("md:col-span-4 lg:col-span-3 h-[300px] md:h-full", selectedTaskId && "hidden md:block")}>
          <HvacTaskQueue tasks={d.tasks} selectedId={selectedTaskId} onSelect={setSelectedTaskId} />
        </div>
        
        {/* Back button for mobile when task is selected */}
        {selectedTaskId && (
          <div className="md:hidden">
             <button onClick={() => setSelectedTaskId(undefined)} className="text-[12px] text-teal-400 font-bold mb-2">← Back to Tasks</button>
          </div>
        )}

        <div className={cn("md:col-span-8 lg:col-span-6 h-[500px] md:h-full", !selectedTaskId && "hidden md:block")}>
          <HvacTaskWorkspace task={selectedTask} />
        </div>
        
        <div className={cn("hidden lg:block lg:col-span-3 h-[300px] md:h-full")}>
          <HvacMonitoringPanel systems={d.systems} />
        </div>
      </div>
    </div>
  );
}
