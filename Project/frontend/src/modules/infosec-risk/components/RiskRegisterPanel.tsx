'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SecurityRisk } from '../types/infosec-risk.types';

interface RiskRegisterPanelProps {
  risks: SecurityRisk[];
  onSelectRisk?: (id: string) => void;
  activeRiskId?: string;
}

const riskLevelConfig = {
  Critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-red-500', indicator: 'border-l-red-500' },
  High: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', bar: 'bg-rose-500', indicator: 'border-l-rose-500' },
  Medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500', indicator: 'border-l-amber-500' },
  Low: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', bar: 'bg-teal-500', indicator: 'border-l-teal-500' },
};

export const RiskRegisterPanel: React.FC<RiskRegisterPanelProps> = ({ risks, onSelectRisk, activeRiskId }) => {
  const sorted = [...risks].sort((a, b) => b.severityScore - a.severityScore);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Risk Register"
        icon={<ShieldAlert className="w-4 h-4" />}
        action={
          <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
            {risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length} Critical/High
          </span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {sorted.map((risk) => {
            const cfg = riskLevelConfig[risk.riskLevel];
            return (
              <div
                key={risk.id}
                onClick={() => onSelectRisk?.(risk.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activeRiskId === risk.id ? `bg-white/[0.04] ${cfg.indicator}` : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <p className="text-[10px] font-mono text-gray-500 mb-0.5">{risk.id} • {risk.category}</p>
                    <h4 className="text-sm font-medium text-white leading-snug">{risk.title}</h4>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0", cfg.bg, cfg.border, cfg.text)}>
                    {risk.riskLevel}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>Severity Score</span>
                    <span className={cn("font-bold", cfg.text)}>{risk.severityScore}/25</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", cfg.bar)} style={{ width: `${(risk.severityScore / 25) * 100}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-500">Owner: {risk.owner}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10",
                    risk.status === 'Open' ? 'text-rose-400' : risk.status === 'Mitigating' ? 'text-amber-400' : 'text-emerald-400'
                  )}>
                    {risk.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
