'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { GitBranch, PlayCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { CicdPipeline, PipelineStage } from '../types/devops.types';

interface PipelinePanelProps {
  pipelines: CicdPipeline[];
  onSelectPipeline?: (id: string) => void;
  activePipelineId?: string;
  onRetrigger: (id: string) => void;
}

const stageStatusConfig: Record<string, string> = {
  Success: 'bg-emerald-500 text-white',
  Running: 'bg-indigo-500 text-white animate-pulse',
  Failed: 'bg-red-500 text-white',
  Pending: 'bg-white/10 text-gray-500',
  Skipped: 'bg-white/5 text-gray-600',
};

const pipelineStatusConfig: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  Success: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  Running: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', dot: 'bg-indigo-400 animate-pulse' },
  Failed: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400' },
  Queued: { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', dot: 'bg-gray-400' },
  Cancelled: { text: 'text-gray-500', bg: 'bg-white/5', border: 'border-white/10', dot: 'bg-gray-500' },
};

const MiniStages: React.FC<{ stages: PipelineStage[] }> = ({ stages }) => (
  <div className="flex items-center gap-1 mt-2">
    {stages.map((stage, i) => (
      <React.Fragment key={stage.name}>
        <div className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", stageStatusConfig[stage.status])}>
          {stage.name.split(' ')[0]}
        </div>
        {i < stages.length - 1 && <div className="w-3 h-px bg-white/10" />}
      </React.Fragment>
    ))}
  </div>
);

export const PipelinePanel: React.FC<PipelinePanelProps> = ({ pipelines, onSelectPipeline, activePipelineId, onRetrigger }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="CI/CD Pipelines"
        icon={<GitBranch className="w-4 h-4" />}
        action={
          <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
            {pipelines.filter(p => p.status === 'Running').length} Running
          </span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {pipelines.map((pipeline) => {
            const cfg = pipelineStatusConfig[pipeline.status] || pipelineStatusConfig.Queued;
            const mins = Math.floor(pipeline.durationSeconds / 60);
            const secs = pipeline.durationSeconds % 60;

            return (
              <div
                key={pipeline.id}
                onClick={() => onSelectPipeline?.(pipeline.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activePipelineId === pipeline.id
                    ? "bg-white/[0.04] border-l-indigo-500"
                    : pipeline.status === 'Failed' ? "border-l-red-500"
                    : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1 mr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                      <p className="text-[10px] font-mono text-gray-500">{pipeline.id}</p>
                    </div>
                    <h4 className="text-sm font-medium text-white leading-snug">{pipeline.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                      {pipeline.branch} @ {pipeline.commitSha}
                    </p>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0", cfg.bg, cfg.border, cfg.text)}>
                    {pipeline.status}
                  </span>
                </div>

                <MiniStages stages={pipeline.stages} />

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>by {pipeline.triggeredBy}</span>
                    {pipeline.durationSeconds > 0 && (
                      <span className="font-mono">{mins}m {secs}s</span>
                    )}
                  </div>
                  {pipeline.status === 'Failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] border-white/10 text-white h-6 px-2"
                      onClick={(e) => { e.stopPropagation(); onRetrigger(pipeline.id); }}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Retry
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
