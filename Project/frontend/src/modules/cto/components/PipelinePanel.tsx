'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PipelineRun } from '../types/cto.types';
import { GitBranch, RotateCcw } from 'lucide-react';
import { useRetryPipeline } from '../hooks/useCtoAnalytics';

interface PipelinePanelProps {
  pipelines: PipelineRun[];
}

const statusStyle: Record<string, { badge: string; dot: string }> = {
  success: { badge: 'bg-success/20 text-success-light', dot: 'bg-success' },
  failed:  { badge: 'bg-emergency/20 text-emergency-light', dot: 'bg-emergency' },
  running: { badge: 'bg-indigo-500/20 text-indigo-300', dot: 'bg-indigo-400 animate-pulse' },
  queued:  { badge: 'bg-white/10 text-gray-300', dot: 'bg-gray-400' },
};

export function PipelinePanel({ pipelines }: PipelinePanelProps) {
  const { mutate: retry, isPending } = useRetryPipeline();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between font-sans">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">CI/CD Pipelines</h3>
            <p className="text-xs text-gray-400 mt-0.5">Recent builds & deployments</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {pipelines.map(p => {
            const st = statusStyle[p.status];
            return (
              <div key={p.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                    <span className="text-sm font-bold text-white">{p.repo}</span>
                    <span className="text-[10px] text-gray-500">/{p.branch}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${st.badge}`}>
                    {p.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
                  <span>stage: <span className="text-gray-300">{p.stage}</span></span>
                  <span>commit: <span className="text-indigo-300">{p.commit}</span></span>
                  <span>trigger: <span className="text-gray-300">{p.triggeredBy}</span></span>
                  {p.duration && <span>duration: <span className="text-gray-300">{p.duration}s</span></span>}
                </div>
                
                {p.status === 'failed' && (
                  <Button variant="outline" size="sm" className="mt-2 text-xs h-7 gap-1 font-sans opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => retry(p.id)} disabled={isPending}>
                    <RotateCcw className="w-3 h-3" /> Retry
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
