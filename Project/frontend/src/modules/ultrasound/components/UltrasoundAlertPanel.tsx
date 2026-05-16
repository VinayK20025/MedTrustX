'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { UltrasoundAlert } from '../types/ultrasound.types';
import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: UltrasoundAlert[]; }

export function UltrasoundAlertPanel({ alerts }: Props) {
  const active = alerts.filter(a => a.status === 'Active');

  return (
    <Card className={cn("shadow-glass h-full flex flex-col bg-surface-light", active.length > 0 ? "border-emergency/40" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg relative", active.length > 0 ? "bg-emergency/20" : "bg-white/5")}>
            <AlertTriangle className={cn("w-4 h-4", active.length > 0 ? "text-emergency-light animate-pulse" : "text-gray-400")} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Monitoring Alerts</h3>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        {active.length === 0 ? (
           <div className="p-8 text-center text-[12px] text-gray-500 font-bold">Transducer telemetry nominal. No delays.</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {active.map(alert => (
              <div key={alert.id} className={cn("px-5 py-4 border-l-2", alert.severity === 'critical' ? 'bg-emergency/[0.05] border-emergency' : 'bg-warning/[0.05] border-warning')}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={cn("text-[13px] font-bold flex items-center gap-2", alert.severity === 'critical' ? 'text-emergency-light' : 'text-warning-light')}>
                    {alert.type}
                  </h4>
                  {alert.patientId && <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono">{alert.patientId}</span>}
                </div>
                <p className="text-[11px] text-gray-300 mb-2">{alert.message}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="flex items-center gap-1 text-[9px] text-gray-500 font-mono"><Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
