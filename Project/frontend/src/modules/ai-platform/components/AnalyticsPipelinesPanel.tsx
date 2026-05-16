'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { GitBranch, Play, AlertTriangle, CheckCircle2, Pause, XCircle, Clock, RefreshCw } from 'lucide-react';
import type { AnalyticsPipeline, PipelineStatus } from '../types';

const STATUS_CFG: Record<PipelineStatus, { color: string; bg: string; icon: React.ElementType }> = {
  Running: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: RefreshCw },
  Idle:    { color: 'text-gray-400',    bg: 'bg-white/[0.04] border-white/[0.06]',      icon: Clock    },
  Failed:  { color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',        icon: XCircle  },
  Paused:  { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',      icon: Pause    },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

interface Props {
  pipelines: AnalyticsPipeline[];
  onTrigger: (id: string) => void;
}

export const AnalyticsPipelinesPanel: React.FC<Props> = ({ pipelines, onTrigger }) => {
  const failed  = pipelines.filter(p => p.status === 'Failed');
  const running = pipelines.filter(p => p.status === 'Running');

  return (
    <div className="h-full flex flex-col bg-surface-dark border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10">
            <GitBranch className="w-4 h-4 text-teal-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Analytics Pipelines</h3>
          {failed.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full">
              <XCircle className="w-3 h-3" /> {failed.length} Failed
            </span>
          )}
        </div>
        <div className="flex gap-3 mt-1.5 text-[10px]">
          <span className="text-emerald-400">{running.length} Running</span>
          <span className="text-gray-500">{pipelines.filter(p => p.status === 'Idle').length} Idle</span>
          {failed.length > 0 && <span className="text-rose-400 font-semibold">{failed.length} Failed</span>}
        </div>
      </div>

      {/* Pipeline List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {pipelines.map(p => {
          const cfg = STATUS_CFG[p.status];
          const Icon = cfg.icon;
          const isRunning = p.status === 'Running';

          return (
            <div key={p.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <span className="text-[8px] text-gray-600 bg-white/[0.04] px-1.5 rounded border border-white/[0.06]">{p.domain}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Schedule: <span className="text-gray-400">{p.schedule}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={cn('flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border', cfg.bg, cfg.color)}>
                    <Icon className={cn('w-2.5 h-2.5', isRunning && 'animate-spin')} />
                    {p.status}
                  </span>
                  {(p.status === 'Failed' || p.status === 'Idle') && (
                    <button
                      onClick={() => onTrigger(p.id)}
                      className="p-1 rounded-md bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors border border-teal-500/20"
                      title="Trigger now"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/[0.03] rounded-lg px-2 py-1">
                  <p className="text-[8px] text-gray-600 uppercase">Records</p>
                  <p className="text-[11px] font-mono font-bold text-white">{formatNumber(p.recordsProcessed)}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-2 py-1">
                  <p className="text-[8px] text-gray-600 uppercase">Duration</p>
                  <p className="text-[11px] font-mono font-bold text-white">{p.durationSeconds > 0 ? `${Math.floor(p.durationSeconds / 60)}m ${p.durationSeconds % 60}s` : '—'}</p>
                </div>
                <div className={cn('rounded-lg px-2 py-1', p.errorRate > 0 ? 'bg-rose-500/5' : 'bg-white/[0.03]')}>
                  <p className="text-[8px] text-gray-600 uppercase">Error Rate</p>
                  <p className={cn('text-[11px] font-mono font-bold', p.errorRate > 0 ? 'text-rose-400' : 'text-emerald-400')}>
                    {(p.errorRate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Datasets */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {p.inputDatasets.map(ds => (
                  <span key={ds} className="text-[9px] bg-white/[0.04] text-gray-500 px-1.5 py-0.5 rounded-md font-mono border border-white/[0.04]">
                    {ds}
                  </span>
                ))}
              </div>

              {/* Next run */}
              <p className="text-[9px] text-gray-600 mt-1">
                Next: <span className="text-gray-400">{new Date(p.nextRunAt).toLocaleString()}</span>
                {' '}· Owner: <span className="text-gray-400">{p.owner}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
