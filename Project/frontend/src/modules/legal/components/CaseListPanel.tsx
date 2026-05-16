'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { LegalCase } from '../types/legal.types';
import { Scale, AlertTriangle, Briefcase, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: LegalCase[]; selectedId?: string; onSelect: (id: string) => void; }

const severityConfig = { High: 'border-emergency bg-emergency/[0.04]', Medium: 'border-orange-500 bg-orange-500/[0.04]', Low: 'border-blue-500 bg-blue-500/[0.04]' };

export function CaseListPanel({ cases, selectedId, onSelect }: Props) {
  const activeCases = cases.filter(c => c.status !== 'Closed');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-400" /> Litigation Cases
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {activeCases.map(c => (
            <div key={c.id} onClick={() => onSelect(c.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                severityConfig[c.severity],
                selectedId === c.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {c.severity === 'High' && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light" />}
                  <span className="text-[10px] font-mono text-gray-500">{c.id}</span>
                  <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border tracking-wider',
                    c.status === 'In Court' ? 'bg-emergency/15 text-emergency-light border-emergency/30' :
                    c.status === 'Settlement' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  )}>{c.status}</span>
                </div>
              </div>

              <h4 className="text-[14px] font-black text-white mb-1">{c.title}</h4>
              <p className="text-[11px] font-semibold text-gray-300">{c.type}</p>
              
              <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 border-t border-white/5 pt-2">
                <span>{c.department || 'Hospital Wide'}</span>
                {c.nextHearingDate && (
                  <span className="text-emergency-light font-bold">Hearing: {new Date(c.nextHearingDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
