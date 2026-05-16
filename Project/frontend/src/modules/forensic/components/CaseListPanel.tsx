'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ForensicCase } from '../types/forensic.types';
import { useGenerateMLR } from '../hooks/useForensicAnalytics';
import { Fingerprint, ShieldAlert, FileDown, Syringe, Skull, UserX, Ban } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: ForensicCase[]; selectedId?: string; onSelect: (id: string) => void; }

const typeIcon: Record<string, React.ElementType> = { Assault: ShieldAlert, 'Sexual Assault': Ban, Poisoning: Syringe, 'Post-Mortem': Skull, Accident: UserX, 'Unknown Death': Skull };
const typeColor: Record<string, string> = { Assault: 'text-red-300 bg-red-500/15', 'Sexual Assault': 'text-purple-300 bg-purple-500/15', Poisoning: 'text-yellow-300 bg-yellow-500/15', 'Post-Mortem': 'text-gray-300 bg-gray-500/15', Accident: 'text-orange-300 bg-orange-500/15', 'Unknown Death': 'text-gray-300 bg-gray-500/15' };
const statusBorder: Record<string, string> = { Active: 'border-red-500 bg-red-500/[0.04]', 'Examination Done': 'border-blue-500 bg-blue-500/[0.04]', 'Report Pending': 'border-warning bg-warning/[0.04]', Closed: 'border-gray-500 bg-gray-500/[0.04]' };

export function CaseListPanel({ cases, selectedId, onSelect }: Props) {
  const { mutate: genMLR } = useGenerateMLR();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-red-400" /> Forensic Cases
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{cases.filter(c => c.status === 'Active').length} Active</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => {
            const TIcon = typeIcon[c.type] || Fingerprint;
            return (
              <div key={c.id} onClick={() => onSelect(c.id)}
                className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                  statusBorder[c.status],
                  selectedId === c.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
                )}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-gray-400">{c.id}</span>
                  <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1', typeColor[c.type])}>
                    <TIcon className="w-2.5 h-2.5" /> {c.type}
                  </span>
                </div>

                <h4 className="text-[14px] font-bold text-white mb-0.5">{c.patientName}</h4>
                <p className="text-[10px] text-gray-400">{c.age}y {c.gender} • {c.referredBy}</p>
                {c.firNumber && <p className="text-[10px] text-red-400 font-bold mt-1">FIR: {c.firNumber}</p>}

                <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                  <span className="text-gray-500">{c.evidenceCount} evidence items</span>
                  {c.status === 'Report Pending' && (
                    <Button onClick={(e) => { e.stopPropagation(); genMLR(c.id); }} size="sm" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] h-6 hover:bg-blue-500/20" leftIcon={<FileDown className="w-2.5 h-2.5" />}>Gen MLR</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
