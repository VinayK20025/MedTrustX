'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TranscriptionQueue } from '../components/TranscriptionQueue';
import { TranscriptionAudioEditor } from '../components/TranscriptionAudioEditor';
import { TranscriptionToolsPanel } from '../components/TranscriptionToolsPanel';
import { useTranscriptionDashboard } from '../hooks/useTranscriptionAnalytics';
import type { TranscriptionFilters } from '../services/transcription.api';
import type { TranscriptionKPI } from '../types/transcription.types';
import { Headphones, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function TransKPICard({ kpi }: { kpi: TranscriptionKPI }) {
  const router = useRouter();
  const statusColors: Record<string, string> = {
    success:  'border-success/20 hover:border-success/40',
    normal:   'border-white/[0.06] hover:border-white/[0.12]',
    warning:  'border-warning/20 hover:border-warning/40',
    critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
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
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
          {kpi.status === 'critical' && <AlertTriangle className="w-3 h-3 text-emergency-light" />}
          {kpi.title}
        </p>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>
        {kpi.value.toLocaleString()}
      </p>
      {kpi.actionLabel && (
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {kpi.actionLabel} <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
    </div>
  );
}

export function TranscriptionDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<TranscriptionFilters>({});
  const { data, isLoading } = useTranscriptionDashboard(filters);

  useEffect(() => {
    setPageMeta('Medical Transcriptionist', 'High-performance audio dictation to text conversion workstation');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in w-full h-[calc(100vh-120px)] overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in w-full max-w-[1800px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
        <Breadcrumbs items={[{ label: 'Documentation' }, { label: 'Transcription Workspace' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/25">
          <Headphones className="w-3.5 h-3.5" />
          TRANSCRIPTION TERMINAL
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
        {d.kpis.map(kpi => <TransKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Main Orchestration Layout - 3 Column Audio/Text Layout */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Dictation Queue */}
        <div className="col-span-2 h-full min-h-0">
          <TranscriptionQueue queue={d.queue} />
        </div>
        
        {/* Center: Audio + Editor (Core) */}
        <div className="col-span-7 h-full min-h-0">
          <TranscriptionAudioEditor active={d.activeEditor} />
        </div>

        {/* Right: Tools & QA */}
        <div className="col-span-3 h-full min-h-0">
           <TranscriptionToolsPanel 
             templates={d.templates} 
             snippets={d.snippets} 
             qaFlags={d.activeEditor?.qaFlags || []} 
           />
        </div>
      </div>
    </div>
  );
}
