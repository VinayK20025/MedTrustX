'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Boxes, GitBranch, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { MicroService } from '../types/developer.types';

interface ProjectPanelProps {
  services: MicroService[];
  onSelectService?: (id: string) => void;
  activeServiceId?: string;
  onTriggerBuild: (id: string) => void;
}

const statusConfig: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Active: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'In Development': { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', dot: 'bg-indigo-400 animate-pulse' },
  Deprecated: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-400' },
  Paused: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
};

const langColors: Record<string, string> = {
  TypeScript: 'bg-blue-500/20 text-blue-300',
  Java: 'bg-orange-500/20 text-orange-300',
  Python: 'bg-yellow-500/20 text-yellow-300',
  Go: 'bg-teal-500/20 text-teal-300',
  JavaScript: 'bg-yellow-500/20 text-yellow-300',
  'C#': 'bg-purple-500/20 text-purple-300',
};

const CoverageBar: React.FC<{ value: number }> = ({ value }) => (
  <div>
    <div className="flex justify-between text-[10px] mb-1">
      <span className="text-gray-500">Coverage</span>
      <span className={cn("font-bold", value >= 80 ? "text-emerald-400" : value >= 60 ? "text-amber-400" : "text-rose-400")}>{value}%</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full", value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-rose-500")}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export const ProjectPanel: React.FC<ProjectPanelProps> = ({ services, onSelectService, activeServiceId, onTriggerBuild }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Services"
        icon={<Boxes className="w-4 h-4" />}
        action={
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
            {services.filter(s => s.status === 'Active').length} Active
          </span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {services.map((svc) => {
            const cfg = statusConfig[svc.status] || statusConfig.Active;
            const langColor = langColors[svc.language] || 'bg-white/10 text-gray-400';

            return (
              <div
                key={svc.id}
                onClick={() => onSelectService?.(svc.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activeServiceId === svc.id ? "bg-white/[0.04] border-l-indigo-500" :
                  svc.openIssues > 0 ? "border-l-amber-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                      <p className="text-[10px] font-mono text-gray-500">{svc.id} · {svc.version}</p>
                    </div>
                    <h4 className="text-sm font-medium text-white">{svc.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{svc.description}</p>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0", cfg.bg, cfg.border, cfg.text)}>
                    {svc.status === 'In Development' ? 'Dev' : svc.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono", langColor)}>{svc.language}</span>
                  <span className="text-[10px] text-gray-500">{svc.framework}</span>
                </div>

                <CoverageBar value={svc.coverage} />

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {svc.repository.split('/')[1]}
                    </span>
                    {svc.openIssues > 0 && (
                      <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        {svc.openIssues} issue{svc.openIssues > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] border-white/10 text-white h-6 px-2"
                    onClick={(e) => { e.stopPropagation(); onTriggerBuild(svc.id); }}
                  >
                    <Zap className="w-3 h-3 mr-1" /> Build
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
