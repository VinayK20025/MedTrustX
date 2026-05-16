'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CertificationAlert } from '../types/training.types';
import { useSendTrainingReminder } from '../hooks/useTrainingAnalytics';
import { ShieldAlert, Bell, Ban, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: CertificationAlert[]; }

const sevIcon: Record<CertificationAlert['severity'], React.ReactNode> = {
  Critical: <Ban className="w-4 h-4 text-emergency-light" />,
  Warning: <AlertTriangle className="w-4 h-4 text-warning-light" />,
  Info: <Info className="w-4 h-4 text-blue-400" />,
};

export function TrainingCertAlertPanel({ alerts }: Props) {
  const { mutate: remind, isPending } = useSendTrainingReminder();

  return (
    <Card className="border-rose-500/25 shadow-glass bg-[#0a0304] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-rose-400">CERT ALERTS</h3>
        </div>
        <span className="text-[10px] bg-emergency/20 text-emergency-light px-2 py-0.5 rounded font-bold">{alerts.filter(a => a.severity === 'Critical').length} expired</span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {alerts.map(a => (
            <div key={a.id} className={cn("p-4", a.severity === 'Critical' && "bg-emergency/[0.04]")}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{sevIcon[a.severity]}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-white">{a.staffName}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{a.role} • {a.certification}</p>
                  <p className={cn("text-[11px] font-mono font-bold mt-1",
                    a.daysRemaining < 0 ? "text-emergency-light" : a.daysRemaining < 30 ? "text-warning-light" : "text-gray-400"
                  )}>
                    {a.daysRemaining < 0 ? `EXPIRED ${Math.abs(a.daysRemaining)}d ago` : `Expires in ${a.daysRemaining}d`}
                  </p>
                </div>
                <Button size="sm" disabled={isPending} onClick={() => remind(a.id)}
                  className="h-7 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] shrink-0" leftIcon={<Bell className="w-3 h-3" />}>
                  Remind
                </Button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <div className="p-8 text-center text-[12px] text-gray-500">All certifications valid</div>}
        </div>
      </CardBody>
    </Card>
  );
}
