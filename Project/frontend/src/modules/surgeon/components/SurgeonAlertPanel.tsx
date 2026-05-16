'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SurgicalAlert } from '../types/surgeon.types';
import { ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: SurgicalAlert[]; }

export function SurgeonAlertPanel({ alerts }: Props) {
  const active = alerts.filter(a => a.status === 'Active');

  return (
    <Card className={cn("shadow-glass h-full flex flex-col bg-surface-light", active.length > 0 ? "border-emergency/40" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg relative", active.length > 0 ? "bg-emergency/20" : "bg-white/5")}>
            <ShieldAlert className={cn("w-4 h-4", active.length > 0 ? "text-emergency-light animate-pulse" : "text-gray-400")} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Intra-Op Alerts</h3>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        {active.length === 0 ? (
           <div className="p-8 text-center text-[12px] text-gray-500 font-bold">No active surgical alerts.</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {active.map(alert => (
              <div key={alert.id} className="px-5 py-4 bg-emergency/[0.05] border-l-2 border-emergency">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    {alert.severity === 'critical' ? <ShieldAlert className="w-3.5 h-3.5 text-emergency-light" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning-light" />}
                    {alert.type}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-400 mb-2">{alert.message}</p>
                <span className="flex items-center gap-1 text-[9px] text-gray-500 font-mono"><Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
