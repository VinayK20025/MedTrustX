'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { Cpu, Activity, CheckCircle2, XCircle, Clock, RefreshCw, Layers } from 'lucide-react';
import type { TrainingJob, TrainingStatus } from '../types';

const STATUS_CFG: Record<TrainingStatus, { color: string; icon: React.ElementType; bar: string }> = {
  Running:   { color: 'text-indigo-400', icon: RefreshCw, bar: 'bg-indigo-500' },
  Queued:    { color: 'text-amber-400',  icon: Clock,     bar: 'bg-amber-500'  },
  Completed: { color: 'text-emerald-400',icon: CheckCircle2, bar: 'bg-emerald-500' },
  Failed:    { color: 'text-rose-400',   icon: XCircle,   bar: 'bg-rose-500'   },
  Cancelled: { color: 'text-gray-400',   icon: XCircle,   bar: 'bg-gray-600'   },
};

interface Props {
  jobs: TrainingJob[];
  onCancel: (id: string) => void;
}

export const TrainingJobsPanel: React.FC<Props> = ({ jobs, onCancel }) => {
  const running   = jobs.filter(j => j.status === 'Running');
  const queued    = jobs.filter(j => j.status === 'Queued');
  const completed = jobs.filter(j => j.status === 'Completed');

  return (
    <div className="h-full flex flex-col bg-surface-dark border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Training Jobs</h3>
        </div>
        <div className="flex gap-3 mt-2 text-[10px]">
          <span className="text-indigo-400 font-semibold">{running.length} Running</span>
          <span className="text-amber-400 font-semibold">{queued.length} Queued</span>
          <span className="text-emerald-400 font-semibold">{completed.length} Completed</span>
        </div>
      </div>

      {/* GPU Utilization Summary */}
      {running.length > 0 && (
        <div className="px-4 py-2 bg-indigo-500/5 border-b border-indigo-500/10 flex-shrink-0">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-gray-400 flex items-center gap-1"><Cpu className="w-3 h-3" /> GPU Cluster</span>
            <span className="text-indigo-300 font-mono font-semibold">{running[0].gpuUtilization}% utilized</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
              style={{ width: `${running[0].gpuUtilization}%` }} />
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1.5">
        {jobs.map(job => {
          const cfg = STATUS_CFG[job.status];
          const Icon = cfg.icon;
          const isRunning = job.status === 'Running';

          return (
            <div key={job.id} className="rounded-xl border border-white/[0.06] bg-surface-light p-3">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-semibold text-white">{job.modelName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Dataset {job.datasetVersion} · Triggered by <span className="text-gray-400 capitalize">{job.triggeredBy}</span>
                  </p>
                </div>
                <span className={cn('flex items-center gap-1 text-[9px] font-bold', cfg.color)}>
                  <Icon className={cn('w-3 h-3', isRunning && 'animate-spin')} />
                  {job.status}
                </span>
              </div>

              {/* Progress bar for running/completed */}
              {(isRunning || job.status === 'Completed') && (
                <div className="mb-2">
                  <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                    <span>Epoch {job.epochsCurrent}/{job.epochsTotal}</span>
                    <span className="font-mono text-gray-400">{job.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div className={cn('h-full rounded-full transition-all duration-700', cfg.bar)}
                      style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
              )}

              {/* Metrics grid for running */}
              {isRunning && (
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[
                    { label: 'Loss', value: job.lossValue.toFixed(4) },
                    { label: 'Val Acc', value: `${job.validationAccuracy.toFixed(1)}%` },
                    { label: 'RAM', value: `${job.memoryUsedGb}GB` },
                  ].map(m => (
                    <div key={m.label} className="bg-white/[0.03] rounded-lg px-2 py-1 text-center">
                      <p className="text-[8px] text-gray-500 uppercase">{m.label}</p>
                      <p className="text-[10px] font-mono font-bold text-white">{m.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {job.notes && (
                <p className="text-[10px] text-gray-500 italic mb-2">{job.notes}</p>
              )}

              {/* Actions */}
              {(isRunning || job.status === 'Queued') && (
                <button
                  onClick={() => onCancel(job.id)}
                  className="w-full py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-semibold hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                >
                  Cancel Job
                </button>
              )}

              {job.status === 'Completed' && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Final Accuracy: <strong className="font-mono">{job.validationAccuracy.toFixed(1)}%</strong></span>
                  <span className="text-gray-600 ml-auto">Loss: {job.lossValue.toFixed(4)}</span>
                </div>
              )}
            </div>
          );
        })}

        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <Layers className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No training jobs</p>
          </div>
        )}
      </div>
    </div>
  );
};
