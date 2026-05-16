'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DocumentVerification } from '../types/hrExec.types';
import { useVerifyDocument } from '../hooks/useHrExecAnalytics';
import { FileSearch, CheckCircle2, Clock, Ban, Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { documents: DocumentVerification[]; }

const statusCfg: Record<DocumentVerification['status'], { icon: React.ReactNode; color: string }> = {
  Verified: { icon: <CheckCircle2 className="w-4 h-4 text-success-light" />, color: 'text-success-light' },
  Pending:  { icon: <Clock className="w-4 h-4 text-warning-light" />, color: 'text-warning-light' },
  Rejected: { icon: <Ban className="w-4 h-4 text-emergency-light" />, color: 'text-emergency-light' },
};

export function HrExecDocumentPanel({ documents }: Props) {
  const { mutate: verify, isPending } = useVerifyDocument();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <FileSearch className="w-4 h-4 text-violet-400" />
        <h3 className="text-[13px] font-bold tracking-widest text-violet-400">DOCUMENT VERIFICATION</h3>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {documents.map(d => {
            const cfg = statusCfg[d.status];
            return (
              <div key={d.id} className="p-4 hover:bg-white/[0.015] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-bold text-white">{d.documentName}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{d.staffName} • {d.documentType}</p>
                    <p className="text-[9px] text-gray-600 font-mono mt-1">Uploaded {new Date(d.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  {d.status === 'Pending' && (
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" disabled={isPending} onClick={() => verify({ docId: d.id, decision: 'Rejected' })} className="h-7 w-7 p-0 bg-white/5 hover:bg-emergency/10 text-gray-400 hover:text-emergency-light rounded-lg">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" disabled={isPending} onClick={() => verify({ docId: d.id, decision: 'Verified' })} className="h-7 w-7 p-0 bg-success/10 hover:bg-success/20 text-success-light rounded-lg">
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                  {d.status !== 'Pending' && (
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', cfg.color, d.status === 'Verified' ? 'bg-success/10' : 'bg-emergency/10')}>{d.status}</span>
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
