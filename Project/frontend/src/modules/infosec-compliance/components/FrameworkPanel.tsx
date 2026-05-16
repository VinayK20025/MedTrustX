'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { BookCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ComplianceFramework } from '../types/infosec.types';

interface FrameworkPanelProps {
  frameworks: ComplianceFramework[];
  onSelectFramework?: (id: string) => void;
  activeFrameworkId?: string;
}

export const FrameworkPanel: React.FC<FrameworkPanelProps> = ({ frameworks, onSelectFramework, activeFrameworkId }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader 
        title="Compliance Frameworks"
        icon={<BookCheck className="w-4 h-4" />}
        action={
          <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-400 border border-white/10">
            {frameworks.length} Tracked
          </span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {frameworks.map((framework) => {
            const needsReview = framework.status === 'Review Required';

            return (
              <div 
                key={framework.id} 
                onClick={() => onSelectFramework?.(framework.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02]",
                  activeFrameworkId === framework.id ? "bg-white/[0.04] border-l-2 border-teal-500" : "border-l-2 border-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-white">{framework.name}</h4>
                    <p className="text-[10px] text-gray-500">Version {framework.version}</p>
                  </div>
                  <div className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                    needsReview ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-teal-500/10 border-teal-500/20 text-teal-400"
                  )}>
                    {framework.status}
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-gray-400">Compliance Score</span>
                    <span className={cn(
                      "font-medium",
                      framework.complianceScore >= 90 ? "text-emerald-400" : framework.complianceScore >= 80 ? "text-amber-400" : "text-rose-400"
                    )}>{framework.complianceScore}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        framework.complianceScore >= 90 ? "bg-emerald-500" : framework.complianceScore >= 80 ? "bg-amber-500" : "bg-rose-500"
                      )} 
                      style={{ width: `${framework.complianceScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    {framework.implementedControls} / {framework.totalControls} Controls Implemented
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
