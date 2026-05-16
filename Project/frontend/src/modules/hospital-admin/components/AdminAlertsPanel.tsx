'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { HospitalAlert } from '../types/admin.types';
import { useAcknowledgeAlert } from '../hooks/useAdminAnalytics';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: HospitalAlert[]; }

export function AdminAlertsPanel({ alerts }: Props) {
  const { mutate: ack, isPending } = useAcknowledgeAlert();

  return (
    <Card className="border-rose-500/30 shadow-glass bg-[#080304] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-rose-400">CRITICAL COMMAND ALERTS</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {alerts.map(alert => (
            <div key={alert.id} className="p-4 bg-surface-dark border-l-2 border-l-transparent hover:border-l-rose-500 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider", 
                  alert.severity === 'Critical' ? 'bg-emergency/20 text-emergency-light animate-pulse' : 'bg-warning/20 text-warning-light'
                )}>
                  {alert.severity} • {alert.domain}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>

              <div className="text-[12px] text-white font-medium leading-relaxed mb-3">
                {alert.message}
              </div>

              {alert.requiresAction && (
                <div className="flex justify-end pt-2">
                   <Button 
                     size="sm" 
                     disabled={isPending}
                     onClick={() => ack(alert.id)}
                     className="h-8 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                     leftIcon={<CheckCircle2 className="w-3.5 h-3.5"/>}
                   >
                     Acknowledge
                   </Button>
                </div>
              )}
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="p-8 text-center text-[12px] text-gray-500 font-bold">All systems nominal. No critical alerts.</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
