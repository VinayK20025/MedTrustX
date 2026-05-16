'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PAMAlert } from '../types/pam.types';
import { useAcknowledgeAlert } from '../hooks/usePamAnalytics';
import { ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: PAMAlert[]; }

export function PamAlertPanel({ alerts }: Props) {
  const { mutate: acknowledge, isPending } = useAcknowledgeAlert();
  const active = alerts.filter(a => a.status === 'active' || a.status === 'investigating');

  return (
    <Card className={cn("shadow-glass h-full flex flex-col bg-surface-light", active.length > 0 ? "border-emergency/30" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg relative", active.length > 0 ? "bg-emergency/20" : "bg-white/5")}>
            <ShieldAlert className={cn("w-4 h-4", active.length > 0 ? "text-emergency-light animate-pulse" : "text-gray-400")} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">High-Risk Alerts</h3>
            <p className="text-[11px] text-gray-500">{active.length} active incidents</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {alerts.map(alert => (
            <div key={alert.id} className={cn('px-5 py-4 transition-colors hover:bg-white/[0.015]', alert.status === 'active' && 'bg-emergency/[0.02]')}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                  {alert.severity === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light" />}
                  {alert.title}
                </h4>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  alert.status === 'active' ? 'bg-emergency/20 text-emergency-light' :
                  alert.status === 'investigating' ? 'bg-warning/20 text-warning-light' : 'bg-white/5 text-gray-400'
                )}>
                  {alert.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">{alert.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded">{alert.source}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                {alert.status === 'active' && (
                  <Button size="xs" variant="primary" onClick={() => acknowledge(alert.id)} disabled={isPending} className="h-6 text-[10px] bg-emergency hover:bg-emergency-light border-none text-white font-bold">
                    Investigate
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
