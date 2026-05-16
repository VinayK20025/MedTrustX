'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { BookCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AuditControl } from '../types/audit.types';

interface ControlPanelProps {
  controls: AuditControl[];
  onSelectControl?: (id: string) => void;
  activeControlId?: string;
}

const domainColors: Record<string, string> = {
  IT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Clinical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Financial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  HR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Operational: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const effectivenessConfig: Record<string, string> = {
  'Effective': 'text-emerald-400',
  'Partially Effective': 'text-amber-400',
  'Ineffective': 'text-rose-400',
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ controls, onSelectControl, activeControlId }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Control Library"
        icon={<BookCheck className="w-4 h-4" />}
        action={
          <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">
            {controls.length} Controls
          </span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {controls.map((ctrl) => {
            const domainCfg = domainColors[ctrl.domain] || domainColors.Operational;
            const isIneffective = ctrl.effectiveness === 'Ineffective';

            return (
              <div
                key={ctrl.id}
                onClick={() => onSelectControl?.(ctrl.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activeControlId === ctrl.id
                    ? "bg-white/[0.04] border-l-indigo-500"
                    : isIneffective ? "border-l-rose-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 mb-0.5">{ctrl.id}</p>
                    <h4 className="text-sm font-medium text-white leading-snug">{ctrl.title}</h4>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ml-2 shrink-0", domainCfg)}>
                    {ctrl.domain}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className={cn("font-medium", effectivenessConfig[ctrl.effectiveness])}>
                    ● {ctrl.effectiveness}
                  </span>
                  <span className="text-gray-500">Tested: {new Date(ctrl.lastTested).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {ctrl.mappedStandards.map(std => (
                    <span key={std} className="text-[9px] bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
