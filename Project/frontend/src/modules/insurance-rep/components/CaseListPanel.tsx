'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InsuranceCase } from '../types/insurance-rep.types';
import { Briefcase, AlertTriangle, FileWarning, IndianRupee } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: InsuranceCase[]; selectedId?: string; onSelect: (id: string) => void; }

const statusBorder: Record<string, string> = {
  'Eligibility Check': 'border-blue-500 bg-blue-500/[0.04]',
  'Pre-Auth Pending': 'border-warning bg-warning/[0.04]',
  'Approved': 'border-success bg-success/[0.04]',
  'Rejected': 'border-emergency bg-emergency/[0.04]',
  'Claim Submitted': 'border-purple-500 bg-purple-500/[0.04]',
  'Settled': 'border-gray-500 bg-gray-500/[0.04]',
};

export function CaseListPanel({ cases, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-green-400" /> Insurance Cases
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{cases.length} Active</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => {
            const overLimit = c.estimatedCost > c.coverageLimit;
            return (
              <div key={c.id} onClick={() => onSelect(c.id)}
                className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                  statusBorder[c.status],
                  selectedId === c.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
                )}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-gray-400">{c.id}</span>
                  {c.missingDocs.length > 0 && (
                    <span className="text-[9px] font-bold bg-warning/15 text-warning-light px-1.5 py-0.5 rounded flex items-center gap-1">
                      <FileWarning className="w-2.5 h-2.5" /> Docs Missing
                    </span>
                  )}
                </div>

                <h4 className="text-[14px] font-bold text-white mb-0.5">{c.patientName}</h4>
                <p className="text-[10px] text-gray-400 mb-1">{c.treatment}</p>
                <p className="text-[10px] text-gray-500">{c.insurer} • {c.policyNumber}</p>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 mt-2 bg-black/30 rounded-lg p-2">
                  <div>
                    <p className="text-[9px] text-gray-500">Estimate</p>
                    <p className="text-[12px] font-bold font-mono text-white flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{c.estimatedCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500">Coverage</p>
                    <p className={cn('text-[12px] font-bold font-mono flex items-center gap-0.5', overLimit ? 'text-emergency-light' : 'text-success-light')}><IndianRupee className="w-3 h-3" />{c.coverageLimit.toLocaleString()}</p>
                  </div>
                </div>

                {overLimit && (
                  <div className="flex items-center gap-1 mt-2 text-[9px] text-emergency-light font-bold"><AlertTriangle className="w-3 h-3" /> Estimate exceeds coverage by ₹{(c.estimatedCost - c.coverageLimit).toLocaleString()}</div>
                )}

                <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                  <span className={cn('font-bold uppercase tracking-wider',
                    c.status === 'Approved' ? 'text-success-light' :
                    c.status === 'Pre-Auth Pending' ? 'text-warning-light' :
                    c.status === 'Rejected' ? 'text-emergency-light' : 'text-gray-400'
                  )}>{c.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
