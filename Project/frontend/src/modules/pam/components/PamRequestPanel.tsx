'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PAMRequest } from '../types/pam.types';
import { useApproveRequest, useRejectRequest } from '../hooks/usePamAnalytics';
import { ClipboardList, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { requests: PAMRequest[]; }

export function PamRequestPanel({ requests }: Props) {
  const { mutate: approve, isPending: approving } = useApproveRequest();
  const { mutate: reject, isPending: rejecting } = useRejectRequest();
  const pending = requests.filter(r => r.status === 'pending');

  return (
    <Card className={cn("shadow-glass h-full flex flex-col bg-surface-light", pending.length > 0 ? "border-amber-500/30" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", pending.length > 0 ? "bg-amber-500/20" : "bg-white/5")}>
            <ClipboardList className={cn("w-4 h-4", pending.length > 0 ? "text-amber-400" : "text-gray-400")} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">JIT Elevation Requests</h3>
            <p className="text-[11px] text-gray-500">{pending.length} pending</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {requests.map(req => (
            <div key={req.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{req.requester}</h4>
                  <p className="text-[10px] text-gray-500">{req.department}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  req.status === 'approved' ? 'bg-success/20 text-success-light' : 'bg-white/5 text-gray-400'
                )}>
                  {req.status}
                </span>
              </div>
              
              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                <p className="text-[11px] text-gray-400 mb-1">Target: <strong className="text-indigo-300">{req.targetAccount}</strong> on <strong className="text-gray-300">{req.targetSystem}</strong></p>
                <p className="text-[11px] text-gray-500">"{req.justification}"</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.duration}</span>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="xs" variant="ghost" onClick={() => reject({ requestId: req.id, reason: 'Denied by PAM' })} disabled={rejecting} className="h-6 text-[10px] text-emergency-light hover:bg-emergency/10">
                      Deny
                    </Button>
                    <Button size="xs" variant="primary" onClick={() => approve(req.id)} disabled={approving} className="h-6 text-[10px]">
                      Approve JIT
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
