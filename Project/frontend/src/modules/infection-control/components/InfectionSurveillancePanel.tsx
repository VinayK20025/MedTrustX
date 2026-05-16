'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WardInfectionSummary, InfectionCase } from '../types/infection-control.types';
import { useIsolatePatient } from '../hooks/useInfectionControlAnalytics';
import { FlaskConical, ShieldX, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { wardSummaries: WardInfectionSummary[]; cases: InfectionCase[]; selectedWard?: string; onSelectWard: (ward: string) => void; }

const wardStatusConfig = {
  Outbreak: { border: 'border-l-emergency', bg: 'bg-emergency/[0.05]', badge: 'bg-emergency/20 text-emergency-light border border-emergency/35 animate-pulse', dot: 'bg-emergency-light animate-ping' },
  Elevated: { border: 'border-l-yellow-500', bg: 'bg-yellow-500/[0.03]', badge: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
  Normal:   { border: 'border-l-emerald-600', bg: '',                   badge: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
};

export function InfectionSurveillancePanel({ wardSummaries, cases, selectedWard, onSelectWard }: Props) {
  const { mutate: isolate } = useIsolatePatient();

  const filteredCases = selectedWard ? cases.filter(c => c.ward === selectedWard) : cases;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-teal-500/15"><FlaskConical className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[14px] font-bold text-white">Surveillance</h3>
        </div>
        <span className="text-[9px] text-emergency-light font-bold bg-emergency/10 px-2 py-0.5 rounded border border-emergency/25">{cases.filter(c => c.status === 'Active').length} Active</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {/* Ward heatmap */}
        <div className="px-3 py-3 border-b border-white/[0.04] space-y-2">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Ward Infection Map</p>
          {wardSummaries.map(ward => {
            const cfg = wardStatusConfig[ward.status];
            return (
              <div key={ward.wardId} onClick={() => onSelectWard(ward.wardName)}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl border-l-4 cursor-pointer transition-all', cfg.border, cfg.bg,
                  selectedWard === ward.wardName ? 'ring-1 ring-white/15 bg-white/[0.05]' : 'border border-white/[0.04] hover:border-white/10'
                )}>
                <div className="relative shrink-0">
                  <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-white">{ward.wardName}</span>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', cfg.badge)}>{ward.status}</span>
                  </div>
                  {/* Rate bar */}
                  <div className="w-full bg-black/40 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className={cn('h-full transition-all', ward.status === 'Outbreak' ? 'bg-emergency-500' : ward.status === 'Elevated' ? 'bg-yellow-500' : 'bg-emerald-500')}
                      style={{ width: `${Math.min((ward.infectionRate / 10) * 100, 100)}%` }} />
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">{ward.activeCases} cases • {ward.infectionRate}/1000 pt-days</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Case list */}
        <div className="divide-y divide-white/[0.03]">
          {filteredCases.map(c => (
            <div key={c.id} className={cn('px-4 py-3 flex items-center gap-3',
              c.status === 'Active' && !c.isolated ? 'bg-warning/[0.03]' : ''
            )}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-bold text-white font-mono">{c.patientTag}</span>
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded',
                    c.status === 'Active' ? 'bg-emergency/15 text-emergency-light' :
                    c.status === 'Under Investigation' ? 'bg-yellow-500/15 text-yellow-400' :
                    'bg-success/10 text-success-light'
                  )}>{c.status}</span>
                </div>
                <p className="text-[11px] text-gray-300 font-semibold">{c.infectionType}</p>
                <p className="text-[10px] text-gray-500">{c.ward} • {c.labConfirmed ? '✓ Lab confirmed' : '⏳ Pending lab'}</p>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                {c.isolated
                  ? <span className="flex items-center gap-1 text-[9px] text-blue-300"><ShieldCheck className="w-3 h-3" />Isolated</span>
                  : <button onClick={() => isolate(c.id)} className="flex items-center gap-1 text-[9px] bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/25 px-2 py-0.5 rounded font-bold transition-all">
                      <ShieldX className="w-3 h-3" />Isolate
                    </button>
                }
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
