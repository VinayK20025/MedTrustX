'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ClinicalProtocol } from '../types/med-director.types';
import { ScrollText } from 'lucide-react';

interface Props { protocols: ClinicalProtocol[]; }

const statusStyle: Record<string, string> = {
  active:       'bg-success/20 text-success-light',
  under_review: 'bg-warning/20 text-warning-light',
  draft:        'bg-indigo-500/20 text-indigo-300',
  retired:      'bg-white/10 text-gray-400',
};

export function ProtocolPanel({ protocols }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <ScrollText className="w-5 h-5 text-teal-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Clinical Protocols</h3>
          <p className="text-xs text-gray-400 mt-0.5">SOP adherence & version management</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3">
        {protocols.map(p => (
          <div key={p.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${statusStyle[p.status]}`}>{p.status.replace('_', ' ')}</span>
                <span className="text-[10px] text-gray-500 font-mono">{p.version}</span>
              </div>
              <span className={`text-sm font-black font-mono ${p.adherenceRate >= 90 ? 'text-success-light' : p.adherenceRate >= 80 ? 'text-warning-light' : 'text-emergency-light'}`}>{p.adherenceRate}%</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{p.name}</h4>
            <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full ${p.adherenceRate >= 90 ? 'bg-success' : p.adherenceRate >= 80 ? 'bg-warning' : 'bg-emergency'}`} style={{ width: `${p.adherenceRate}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 text-[10px] text-gray-500">
              <span>Dept: <span className="text-gray-300">{p.department}</span></span>
              <span>Next review: <span className="text-gray-300">{p.nextReview}</span></span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
