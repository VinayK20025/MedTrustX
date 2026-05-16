'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { BrainCircuit, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { GovernanceModel } from '../types/ai-governance.types';

interface GovernancePanelProps {
  models: GovernanceModel[];
  activeModelId?: string;
  onSelectModel: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Pending Approval': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  'Under Review': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Rejected: 'text-red-400 bg-red-500/10 border-red-500/30',
  Archived: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

export const GovernancePanel: React.FC<GovernancePanelProps> = ({ models, activeModelId, onSelectModel, onApprove, onReject }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Model Governance"
        icon={<BrainCircuit className="w-4 h-4" />}
        action={<span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{models.filter(m => m.status === 'Pending Approval').length} Pending</span>}
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
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-white leading-snug">{model.name}</h4>
                    <span className="text-[9px] bg-white/10 text-gray-300 px-1 rounded">{model.version}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">{model.id} • {model.department}</p>
                </div>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", statusColors[model.status])}>
                  {model.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                <div className="bg-black/20 rounded p-1.5 text-center border border-white/5">
                  <p className="text-[9px] text-gray-500 uppercase">Risk</p>
                  <p className={cn("text-xs font-bold mt-0.5", model.riskSeverity === 'High' ? "text-red-400" : model.riskSeverity === 'Medium' ? "text-amber-400" : "text-emerald-400")}>{model.riskSeverity}</p>
                </div>
                <div className="bg-black/20 rounded p-1.5 text-center border border-white/5">
                  <p className="text-[9px] text-gray-500 uppercase">Fairness</p>
                  <p className={cn("text-xs font-bold mt-0.5", model.biasScore >= 0.9 ? "text-emerald-400" : model.biasScore >= 0.8 ? "text-amber-400" : "text-red-400")}>{model.biasScore.toFixed(2)}</p>
                </div>
                <div className="bg-black/20 rounded p-1.5 text-center border border-white/5">
                  <p className="text-[9px] text-gray-500 uppercase">Accuracy</p>
                  <p className="text-xs font-bold text-white mt-0.5">{model.accuracy}%</p>
                </div>
              </div>

              {model.status === 'Pending Approval' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); onApprove(model.id); }}>
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); onReject(model.id); }}>
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
