'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Workflow, PlayCircle, GitCommit, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ClinicalWorkflow } from '../types/informaticist.types';

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Draft: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Deprecated: 'text-gray-400 bg-white/5 border-white/10',
};

interface WorkflowPanelProps {
  workflows: ClinicalWorkflow[];
  activeWorkflowId?: string;
  onSelectWorkflow?: (id: string) => void;
}

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ workflows, activeWorkflowId, onSelectWorkflow }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Clinical Workflows"
        icon={<Workflow className="w-4 h-4" />}
        action={<span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{workflows.filter(w => w.status === 'Active').length} Active</span>}
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {workflows.map(workflow => (
            <div
              key={workflow.id}
              onClick={() => onSelectWorkflow?.(workflow.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                activeWorkflowId === workflow.id ? "bg-white/[0.04] border-l-indigo-500" : "border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-2">
                  <h4 className="text-sm font-medium text-white leading-snug">{workflow.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{workflow.department} • {workflow.id}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", statusColors[workflow.status])}>
                  {workflow.status}
                </span>
              </div>

              {/* Step Visualization */}
              <div className="flex items-center gap-1 mt-2 mb-3 px-1">
                {workflow.steps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center flex-1 group relative">
                      <div className="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50 transition-colors">
                        <span className="text-[8px] text-gray-400">{idx + 1}</span>
                      </div>
                      <div className="absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[9px] text-indigo-300 bg-black/80 px-1 py-0.5 rounded z-10 pointer-events-none">
                        {step}
                      </div>
                    </div>
                    {idx < workflow.steps.length - 1 && <div className="h-px bg-white/10 flex-1" />}
                  </React.Fragment>
                ))}
              </div>

              {workflow.status === 'Active' && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between bg-black/20 rounded px-2 py-1.5 border border-white/5">
                    <span className="text-[10px] text-gray-500">Adoption</span>
                    <span className="text-xs font-bold text-emerald-400">{workflow.adoptionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between bg-black/20 rounded px-2 py-1.5 border border-white/5">
                    <span className="text-[10px] text-gray-500">Time Saved</span>
                    <span className="text-xs font-bold text-indigo-400">{workflow.avgTimeSavedMins}m</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
