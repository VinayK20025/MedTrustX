'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { EthicsCase, ResearchProtocol } from '../types/ethics.types';
import { Scale, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: EthicsCase[]; protocols: ResearchProtocol[]; selectedId?: string; onSelect: (id: string) => void; }

const severityColor = { Critical: 'border-emergency bg-emergency/[0.04]', High: 'border-orange-500 bg-orange-500/[0.04]', Medium: 'border-blue-500 bg-blue-500/[0.04]' };

export function EthicsCasePanel({ cases, protocols, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" /> Pending Reviews
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="bg-black/20 px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.04]">Ethics Cases</div>
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => (
            <div key={c.id} onClick={() => onSelect(c.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                severityColor[c.severity],
                selectedId === c.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-gray-400">{c.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border',
                  c.status === 'Pending Review' ? 'bg-emergency/15 text-emergency-light border-emergency/30' : 'bg-warning/15 text-warning-light border-warning/30'
                )}>{c.status}</span>
              </div>
              <h4 className="text-[13px] font-bold text-white leading-snug">{c.title}</h4>
              <p className="text-[11px] text-gray-400 mt-1">{c.type}</p>
            </div>
          ))}
        </div>

        <div className="bg-black/20 px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.04] border-t border-white/[0.04]">Research Protocols</div>
        <div className="divide-y divide-white/[0.03]">
          {protocols.filter(p => p.status === 'Awaiting Approval').map(p => (
            <div key={p.id} onClick={() => onSelect(p.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 border-purple-500 group relative',
                selectedId === p.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <h4 className="text-[13px] font-bold text-white leading-snug">{p.title}</h4>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-gray-400">{p.type}</p>
                <span className="text-[9px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
