'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CredentialAlert } from '../types/hr.types';
import { useSendCredentialReminder } from '../hooks/useHrAnalytics';
import { ShieldAlert, Bell, AlertTriangle, Ban } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: CredentialAlert[]; }

export function HrCredentialPanel({ alerts }: Props) {
  const { mutate: remind, isPending } = useSendCredentialReminder();

  return (
    <Card className="border-rose-500/25 shadow-glass bg-[#0a0304] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-rose-400">CREDENTIAL ALERTS</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {alerts.map(a => (
            <div key={a.id} className={cn("p-4", a.severity === 'Critical' ? "bg-emergency/[0.04]" : "")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                    {a.staffName}
                    {a.severity === 'Critical' && <Ban className="w-3.5 h-3.5 text-emergency-light" />}
                    {a.severity === 'Warning' && <AlertTriangle className="w-3.5 h-3.5 text-warning-light" />}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{a.role} • {a.licenseType}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider',
                  a.severity === 'Critical' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                )}>{a.severity}</span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className={cn("text-[11px] font-mono font-bold",
                  a.daysRemaining < 0 ? "text-emergency-light" : a.daysRemaining < 30 ? "text-warning-light" : "text-gray-400"
                )}>
                  {a.daysRemaining < 0 ? `EXPIRED ${Math.abs(a.daysRemaining)}d ago` : `Expires in ${a.daysRemaining}d`}
                </span>
                <Button size="sm" disabled={isPending} onClick={() => remind(a.id)}
                  className="h-7 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px]" leftIcon={<Bell className="w-3 h-3" />}>
                  Remind
                </Button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <div className="p-8 text-center text-[12px] text-gray-500">All credentials valid</div>}
        </div>
      </CardBody>
    </Card>
  );
}
