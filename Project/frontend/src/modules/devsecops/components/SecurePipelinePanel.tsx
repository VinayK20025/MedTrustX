'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ShieldAlert, XCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SecurePipeline, ScanType } from '../types/devsecops.types';

interface SecurePipelinePanelProps {
  pipelines: SecurePipeline[];
  onSelectPipeline?: (id: string) => void;
  activePipelineId?: string;
}

const statusConfig = {
  Passed: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Failed: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400', icon: <XCircle className="w-3.5 h-3.5" /> },
  Pending: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400 animate-pulse', icon: <Clock className="w-3.5 h-3.5" /> },
  Bypassed: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-400', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
};

const scanTypeColors: Record<ScanType, string> = {
  'SAST': 'bg-rose-500/20 text-rose-300',
  'DAST': 'bg-orange-500/20 text-orange-300',
  'SCA': 'bg-amber-500/20 text-amber-300',
  'Secret Scan': 'bg-purple-500/20 text-purple-300',
  'Container Scan': 'bg-indigo-500/20 text-indigo-300',
};

export const SecurePipelinePanel: React.FC<SecurePipelinePanelProps> = ({ pipelines, onSelectPipeline, activePipelineId }) => {
  const failedCount = pipelines.filter(p => p.securityStatus === 'Failed').length;

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Secure Pipelines"
        icon={<ShieldAlert className="w-4 h-4" />}
        action={
          failedCount > 0 ? (
            <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
              {failedCount} Blocked
            </span>
          ) : (
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              All Clear
            </span>
          )
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {pipelines.map((pipeline) => {
            const cfg = statusConfig[pipeline.securityStatus];
            return (
              <div
                key={pipeline.id}
                onClick={() => onSelectPipeline?.(pipeline.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activePipelineId === pipeline.id
                    ? "bg-white/[0.04] border-l-indigo-500"
                    : pipeline.securityStatus === 'Failed' ? "border-l-red-500"
                    : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                      <p className="text-[10px] font-mono text-gray-500">{pipeline.id}</p>
                    </div>
                    <h4 className="text-sm font-medium text-white leading-snug">{pipeline.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{pipeline.branch}</p>
                  </div>
                  <div className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", cfg.bg, cfg.border, cfg.text)}>
                    {cfg.icon}
                    <span>{pipeline.securityStatus}</span>
                  </div>
                </div>

                {pipeline.securityStatus === 'Failed' && pipeline.failedGate && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Security gate failed:</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold", scanTypeColors[pipeline.failedGate])}>
                      {pipeline.failedGate}
                    </span>
                  </div>
                )}

                <p className="text-[10px] text-gray-500 mt-2">
                  Last run: {new Date(pipeline.lastRun).toLocaleTimeString()}
                </p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
