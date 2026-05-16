'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { BrainCircuit, ShieldAlert, CheckCircle2, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { EvaluatedModel } from '../types/ai-ethics.types';

interface ModelReviewPanelProps {
  models: EvaluatedModel[];
  activeModelId?: string;
  onSelectModel: (id: string) => void;
  onBlockModel: (id: string) => void;
  onApproveModel: (id: string) => void;
}

const riskColors: Record<string, string> = {
  High: 'text-red-400 bg-red-500/10 border-red-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const statusColors: Record<string, string> = {
  Approved: 'text-emerald-400 border-emerald-500/30',
  'Review Required': 'text-amber-400 border-amber-500/30',
  Blocked: 'text-red-400 border-red-500/30',
  'Under Audit': 'text-indigo-400 border-indigo-500/30',
};

export const ModelReviewPanel: React.FC<ModelReviewPanelProps> = ({ models, activeModelId, onSelectModel, onBlockModel, onApproveModel }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="AI Model Governance"
        icon={<BrainCircuit className="w-4 h-4" />}
        action={<span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{models.filter(m => m.reviewStatus === 'Blocked' || m.reviewStatus === 'Review Required').length} Action Needed</span>}
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {models.map(model => (
            <div
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                activeModelId === model.id ? "bg-white/[0.04] border-l-indigo-500" : "border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <h4 className="text-sm font-medium text-white leading-snug">{model.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{model.id} • {model.department}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", riskColors[model.riskLevel])}>
                  {model.riskLevel} Risk
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 mb-3">
                <p className="text-xs text-gray-400 line-clamp-1">{model.clinicalUse}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {model.humanInTheLoop ? (
                    <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded flex items-center border border-indigo-500/20" title="Human in the loop enforced">
                      <Eye className="w-2.5 h-2.5 mr-1" /> HITL
                    </span>
                  ) : (
                    <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center border border-amber-500/20" title="Fully Automated - No HITL">
                      <BrainCircuit className="w-2.5 h-2.5 mr-1" /> Auto
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", model.reviewStatus === 'Approved' ? 'bg-emerald-500' : model.reviewStatus === 'Blocked' ? 'bg-red-500' : 'bg-amber-500')} />
                  <span className={cn("text-[11px] font-medium border-b border-dashed", statusColors[model.reviewStatus])}>
                    {model.reviewStatus}
                  </span>
                </div>

                <div className="flex gap-2">
                  {(model.reviewStatus === 'Review Required' || model.reviewStatus === 'Blocked') && (
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[9px] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); onApproveModel(model.id); }}>
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Approve
                    </Button>
                  )}
                  {model.reviewStatus !== 'Blocked' && (
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[9px] text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); onBlockModel(model.id); }}>
                      <Lock className="w-2.5 h-2.5 mr-1" /> Block
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
