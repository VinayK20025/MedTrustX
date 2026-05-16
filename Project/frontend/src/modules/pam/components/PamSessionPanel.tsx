'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PAMSession } from '../types/pam.types';
import { useTerminateSession } from '../hooks/usePamAnalytics';
import { Activity, XSquare, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { sessions: PAMSession[]; }

export function PamSessionPanel({ sessions }: Props) {
  const { mutate: terminate, isPending } = useTerminateSession();
  const active = sessions.filter(s => s.status === 'active');

  return (
    <Card className={cn("border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col", active.length > 0 && "border-indigo-500/30")}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", active.length > 0 ? "bg-indigo-500/20" : "bg-white/5")}>
            <Activity className={cn("w-4 h-4", active.length > 0 ? "text-indigo-400 animate-pulse" : "text-gray-400")} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Active Sessions</h3>
            <p className="text-[11px] text-gray-500">{active.length} live</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {sessions.map(sess => (
            <div key={sess.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    {sess.user}
                    <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{sess.connectionType}</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{sess.targetAccount} @ {sess.targetSystem}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                    sess.status === 'active' ? 'bg-success/20 text-success-light' : 'bg-white/5 text-gray-500'
                  )}>
                    {sess.status}
                  </span>
                  {sess.riskScore >= 80 && <span className="text-[9px] text-emergency-light flex items-center gap-0.5"><ShieldAlert className="w-2.5 h-2.5" /> High Risk</span>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <span className="text-[10px] text-gray-400 font-mono">Uptime: {sess.duration}</span>
                {sess.status === 'active' && (
                  <Button size="xs" variant="danger" onClick={() => terminate(sess.id)} disabled={isPending} className="h-6 text-[9px] font-bold" leftIcon={<XSquare className="w-3 h-3" />}>
                    TERMINATE
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
