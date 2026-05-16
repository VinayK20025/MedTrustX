'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ClinicalAlert } from '../types/nurse-ward.types';
import { ShieldAlert, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: ClinicalAlert[]; }

export function NurseAlertsPanel({ alerts }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emergency-light" /> Clinical Alerts
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {alerts.length === 0 ? <p className="text-[12px] text-gray-500 italic">No active clinical alerts.</p> : alerts.map(alert => (
            <div key={alert.id} className="rounded-xl border border-emergency/30 bg-emergency/[0.05] p-4 transition-all">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-widest bg-emergency/20 text-emergency-light animate-pulse">{alert.type}</span>
                <span className="text-[10px] text-gray-400 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>

              <h4 className="text-[13px] font-bold text-white mb-1 leading-snug">{alert.patientName} <span className="text-[11px] font-normal text-gray-400">({alert.bed})</span></h4>
              <div className="flex items-start gap-2 mt-2 bg-black/30 p-2.5 rounded border border-emergency/20">
                <AlertCircle className="w-4 h-4 text-emergency-light shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-200 leading-relaxed">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
