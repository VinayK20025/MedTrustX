'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { GitBranch, CheckCircle, XCircle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { DataPipeline } from '../types/data.types';

const statusConfig: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  Running:  { dot: 'bg-indigo-400 animate-pulse', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  Success:  { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Failed:   { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  Queued:   { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Paused:   { dot: 'bg-gray-400', text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10' },
};

const typeColors: Record<string, string> = {
  ETL: 'bg-teal-500/20 text-teal-300',
  ELT: 'bg-indigo-500/20 text-indigo-300',
  Stream: 'bg-purple-500/20 text-purple-300',
  Batch: 'bg-amber-500/20 text-amber-300',
};

interface PipelinePanelProps {
  pipelines: DataPipeline[];
  activePipelineId?: string;
  onSelectPipeline?: (id: string) => void;
  onRetry: (id: string) => void;
}

export const PipelinePanel: React.FC<PipelinePanelProps> = ({ pipelines, activePipelineId, onSelectPipeline, onRetry }) => {
  const failing = pipelines.filter(p => p.status === 'Failed').length;

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Pipelines"
        icon={<GitBranch className="w-4 h-4" />}
        action={
          failing > 0
            ? <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{failing} failed</span>
            : <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{pipelines.filter(p => p.status === 'Running').length} live</span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {pipelines.map(pl => {
            const cfg = statusConfig[pl.status] || statusConfig.Queued;
            return (
              <div
                key={pl.id}
                onClick={() => onSelectPipeline?.(pl.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activePipelineId === pl.id ? "bg-white/[0.04] border-l-teal-500" :
                  pl.status === 'Failed' ? "border-l-red-500" :
                  pl.status === 'Running' ? "border-l-indigo-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                      <p className="text-[10px] font-mono text-gray-500">{pl.id}</p>
                    </div>
                    <h4 className="text-sm font-medium text-white leading-snug">{pl.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{pl.sourceSystem} → {pl.targetSystem}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", typeColors[pl.type])}>{pl.type}</span>
                    <span className={cn("text-[10px] font-bold", cfg.text)}>{pl.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Records</p>
                    <p className="text-xs font-bold text-white">{pl.recordsProcessed > 0 ? (pl.recordsProcessed / 1000).toFixed(0) + 'K' : '—'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Schedule</p>
                    <p className="text-xs font-bold text-white">{pl.schedule}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Errors</p>
                    <p className={cn("text-xs font-bold", pl.errorCount > 0 ? "text-red-400" : "text-gray-400")}>{pl.errorCount}</p>
                  </div>
                </div>

                {pl.status === 'Failed' && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 h-6 px-2 w-full"
                      onClick={(e) => { e.stopPropagation(); onRetry(pl.id); }}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />Retry Pipeline
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
