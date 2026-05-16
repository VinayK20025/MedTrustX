'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Audit } from '../types/external-auditor.types';
import { useGenerateAuditReport } from '../hooks/useAuditorAnalytics';
import { ClipboardCheck, FileDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { audits: Audit[]; selectedId?: string; onSelect: (id: string) => void; }

const standardColor: Record<string, string> = { NABH: 'text-blue-300 bg-blue-500/15', JCI: 'text-purple-300 bg-purple-500/15', Internal: 'text-gray-300 bg-white/10', 'ISO 9001': 'text-emerald-300 bg-emerald-500/15' };
const statusBorder: Record<string, string> = { Planning: 'border-gray-500 bg-gray-500/[0.04]', Active: 'border-amber-500 bg-amber-500/[0.04]', 'Report Draft': 'border-blue-500 bg-blue-500/[0.04]', Completed: 'border-success bg-success/[0.04]' };

export function AuditListPanel({ audits, selectedId, onSelect }: Props) {
  const { mutate: genReport } = useGenerateAuditReport();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-amber-400" /> Audit Engagements
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{audits.length} Audits</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {audits.map(a => (
            <div key={a.id} onClick={() => onSelect(a.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                statusBorder[a.status],
                selectedId === a.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{a.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider', standardColor[a.standard])}>{a.standard}</span>
              </div>

              <h4 className="text-[13px] font-bold text-white mb-0.5">{a.title}</h4>
              <p className="text-[10px] text-gray-400 mb-2">{a.department} • {a.scope}</p>

              {/* Compliance Score Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">Compliance</span>
                  <span className={cn('font-mono font-bold', a.complianceScore >= 90 ? 'text-success-light' : a.complianceScore >= 80 ? 'text-warning-light' : 'text-emergency-light')}>{a.complianceScore}%</span>
                </div>
                <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div className={cn('h-full transition-all', a.complianceScore >= 90 ? 'bg-emerald-500' : a.complianceScore >= 80 ? 'bg-warning' : 'bg-emergency')} style={{ width: `${a.complianceScore}%` }} />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                {a.findingsCount > 0 ? (
                  <span className="text-emergency-light flex items-center gap-1 font-bold"><AlertTriangle className="w-3 h-3" /> {a.findingsCount} findings</span>
                ) : (
                  <span className="text-success-light flex items-center gap-1 font-bold"><ShieldCheck className="w-3 h-3" /> Clean</span>
                )}
                {a.status === 'Report Draft' && (
                  <Button onClick={(e) => { e.stopPropagation(); genReport(a.id); }} size="sm" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] h-6 hover:bg-blue-500/20" leftIcon={<FileDown className="w-2.5 h-2.5" />}>Export</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
