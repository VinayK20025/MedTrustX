'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { BrainCircuit, PlayCircle, RefreshCw, BoxSelect } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MLModel } from '../types/ml.types';

const statusColors: Record<string, string> = {
  Deployed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Training: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  Staging: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Archived: 'text-gray-400 bg-white/5 border-white/10',
  Failed: 'text-red-400 bg-red-500/10 border-red-500/20',
};

interface ModelPanelProps {
  models: MLModel[];
  activeModelId?: string;
  onSelectModel?: (id: string) => void;
}

export const ModelPanel: React.FC<ModelPanelProps> = ({ models, activeModelId, onSelectModel }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Model Registry"
        icon={<BrainCircuit className="w-4 h-4" />}
        action={<span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{models.filter(m => m.status === 'Deployed').length} Deployed</span>}
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {models.map(model => (
            <div
              key={model.id}
              onClick={() => onSelectModel?.(model.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                activeModelId === model.id ? "bg-white/[0.04] border-l-indigo-500" : "border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-mono text-gray-500">{model.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/5 text-gray-400">{model.version}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white leading-snug">{model.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{model.type} • {model.framework}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", statusColors[model.status])}>
                    {model.status === 'Training' && <RefreshCw className="w-2.5 h-2.5 inline mr-1 animate-spin" />}
                    {model.status}
                  </span>
                </div>
              </div>

              {model.status === 'Deployed' && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center bg-black/20 rounded p-1.5 border border-white/5">
                    <p className="text-[9px] text-gray-500">Accuracy</p>
                    <p className="text-xs font-bold text-emerald-400">{model.accuracy}%</p>
                  </div>
                  <div className="text-center bg-black/20 rounded p-1.5 border border-white/5">
                    <p className="text-[9px] text-gray-500">Latency</p>
                    <p className="text-xs font-bold text-white">{model.latencyMs}ms</p>
                  </div>
                  <div className="text-center bg-black/20 rounded p-1.5 border border-white/5">
                    <p className="text-[9px] text-gray-500">Requests</p>
                    <p className="text-xs font-bold text-white">{(model.requestsToday / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              )}

              {model.status === 'Training' && (
                <div className="mt-3">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-2/3 animate-pulse" />
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1 text-center">Training in progress...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
