'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RespiratoryAlert } from '../types/respiratory.types';
import { useAcknowledgeRespiratoryAlert } from '../hooks/useRespiratoryAnalytics';
import { BellRing, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: RespiratoryAlert[]; }

export function RespiratoryAlertPanel({ alerts }: Props) {
  const { mutate: acknowledge, isPending } = useAcknowledgeRespiratoryAlert();
  const active = alerts.filter(a => a.status === 'Active');

  return (
    <Card className={cn("shadow-glass h-full flex flex-col bg-surface-light", active.length > 0 ? "border-emergency/40" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg relative", active.length > 0 ? "bg-emergency/20" : "bg-white/5")}>
            <BellRing className={cn("w-4 h-4", active.length > 0 ? "text-emergency-light animate-pulse" : "text-gray-400")} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Critical Device Alarms</h3>
            <p className="text-[11px] text-gray-500">{active.length} active alarms</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {alerts.map(alert => (
            <div key={alert.id} className={cn('px-5 py-4 transition-colors', alert.status === 'Active' ? 'bg-emergency/[0.05] border-l-2 border-emergency' : 'hover:bg-white/[0.015]')}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                  {alert.severity === 'critical' ? <ShieldAlert className="w-3.5 h-3.5 text-emergency-light" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning-light" />}
                  {alert.type}
                </h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  alert.status === 'Active' ? 'bg-emergency/20 text-emergency-light animate-pulse' : 'bg-white/5 text-gray-400'
                )}>
                  {alert.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">{alert.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 text-[10px] text-gray-500">
                  <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded inline-block w-max">PT: {alert.patientId}</span>
                  {alert.deviceId && <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded inline-block w-max">DEV: {alert.deviceId}</span>}
                  <span className="flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                {alert.status === 'Active' && (
                  <Button size="xs" variant="primary" onClick={() => acknowledge(alert.id)} disabled={isPending} className="h-6 text-[10px] bg-emergency hover:bg-emergency-light border-none text-white font-bold">
                    Acknowledge
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
