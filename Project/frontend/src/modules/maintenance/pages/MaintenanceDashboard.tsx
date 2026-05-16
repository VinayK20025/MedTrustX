'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { MaintenanceTaskQueue } from '../components/MaintenanceTaskQueue';
import { TaskExecutionWorkspace } from '../components/TaskExecutionWorkspace';
import { EquipmentInfoPanel } from '../components/EquipmentInfoPanel';
import { useMaintenanceDashboard } from '../hooks/useMaintenanceAnalytics';
import type { MaintenanceFilters } from '../services/maintenance.api';
import type { MaintenanceKPI } from '../types/maintenance.types';
import { Wrench, AlertTriangle, Wifi } from 'lucide-react';

function MaintKPICard({ kpi }: { kpi: MaintenanceKPI }) {
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

export function MaintenanceDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<MaintenanceFilters>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [isOnline, setIsOnline] = useState(true);
  const { data, isLoading } = useMaintenanceDashboard(filters);

  useEffect(() => { 
    setPageMeta('Maintenance Engineer', 'Field execution — breakdowns, work orders, and equipment repairs'); 
    
    // Simulate offline mode detection
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
  const equipment = selectedTask ? d.equipment[selectedTask.assetId] : undefined;
  const taskLogs = selectedTask ? d.logs.filter(l => l.taskId === selectedTask.id) : [];

  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in max-w-[1800px] p-2 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Facility' }, { label: 'Field Engineer' }]} />
        <div className="flex items-center gap-3">
           {!isOnline && <span className="text-[10px] bg-warning/20 text-warning-light px-3 py-1.5 rounded-lg border border-warning/30 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> OFFLINE MODE</span>}
           <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
             <Wrench className="w-3.5 h-3.5" /> FIELD OPS
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {d.kpis.map(kpi => <MaintKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[700px]">
        {/* On mobile, stack them. On desktop, layout normally */}
        <div className={cn("md:col-span-4 lg:col-span-3 h-[300px] md:h-full", selectedTaskId && "hidden md:block")}>
          <MaintenanceTaskQueue tasks={d.tasks} selectedId={selectedTaskId} onSelect={setSelectedTaskId} />
        </div>
        
        {/* Back button for mobile when task is selected */}
        {selectedTaskId && (
          <div className="md:hidden">
             <button onClick={() => setSelectedTaskId(undefined)} className="text-[12px] text-blue-400 font-bold mb-2">← Back to Task List</button>
          </div>
        )}

        <div className={cn("md:col-span-8 lg:col-span-6 h-[500px] md:h-full", !selectedTaskId && "hidden md:block")}>
          <TaskExecutionWorkspace task={selectedTask} logs={taskLogs} />
        </div>
        
        <div className={cn("hidden lg:block lg:col-span-3 h-[300px] md:h-full")}>
          {equipment ? <EquipmentInfoPanel equipment={equipment} /> : (
            <div className="h-full border border-white/[0.06] shadow-glass bg-surface-light rounded-xl flex items-center justify-center text-gray-500 text-[13px]">
              Select task to view equipment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
