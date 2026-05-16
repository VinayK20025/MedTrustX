'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { CamerasPanel } from '../components/CamerasPanel';
import { VideoStreamsPanel } from '../components/VideoStreamsPanel';
import { RecordingsPanel } from '../components/RecordingsPanel';
import { SurveillanceEventsPanel } from '../components/SurveillanceEventsPanel';
import { useCCTVSurveillance } from '../hooks/useCCTVSurveillance';
import { Camera, Video, AlertTriangle, HardDrive, Eye, Activity } from 'lucide-react';

interface CCTVKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function CCTVKPICard({ kpi }: { kpi: CCTVKPI }) {
  const statusColors: Record<string, string> = {
    success: 'border-success/20 hover:border-success/40', normal: 'border-white/[0.06] hover:border-white/[0.12]',
    warning: 'border-warning/20 hover:border-warning/40', critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover', statusColors[kpi.status])}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-blue-500/15"><Icon className="w-4 h-4 text-blue-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const CCTVSurveillanceDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useCameras } = useCCTVSurveillance();
  const camQuery = useCameras();

  useEffect(() => {
    setPageMeta('CCTV Surveillance', 'Campus-wide video monitoring, NVR storage, and AI analytics');
  }, [setPageMeta]);

  if (camQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: CCTVKPI[] = [
    { id: 'cams', title: 'Active Cameras', value: 485, status: 'success', icon: Camera, subtitle: 'PTZ & Fixed IP' },
    { id: 'streams', title: 'Live Streams', value: 24, status: 'normal', icon: Video, subtitle: 'Currently viewed' },
    { id: 'storage', title: 'NVR Storage', value: '42.8 TB', status: 'warning', icon: HardDrive, subtitle: '85% Capacity' },
    { id: 'events', title: 'AI Alerts', value: 12, status: 'warning', icon: AlertTriangle, subtitle: 'Motion / Intrusion' },
    { id: 'analytics', title: 'Vision Analytics', value: 'Active', status: 'success', icon: Eye, subtitle: 'Facial & License Plate' },
    { id: 'uptime', title: 'System Uptime', value: '99.8%', status: 'success', icon: Activity, subtitle: 'Core VMS' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'CCTV Surveillance' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <Video className="w-3.5 h-3.5" />
          VIDEO MANAGEMENT SYSTEM
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <CCTVKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[450px]">
          <VideoStreamsPanel />
        </div>
        <div className="xl:col-span-4 h-[450px]">
          <CamerasPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <SurveillanceEventsPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <RecordingsPanel />
        </div>
      </div>
    </div>
  );
};
