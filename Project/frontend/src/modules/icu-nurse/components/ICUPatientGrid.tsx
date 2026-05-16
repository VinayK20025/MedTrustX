'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ICUPatient, ICUVitals } from '../types/icu.types';
import { Activity, HeartPulse, Wind, Droplet, Thermometer } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: ICUPatient[]; }

function VitalBlock({ icon: Icon, label, value, unit, status }: { icon: any, label: string, value: string|number, unit: string, status?: 'critical'|'warning' }) {
  return (
    <div className={cn("flex flex-col p-2 rounded-md bg-surface-dark border", status === 'critical' ? 'border-emergency/50 bg-emergency/10 text-emergency-light animate-pulse' : status === 'warning' ? 'border-warning/50 bg-warning/10 text-warning-light' : 'border-white/[0.04] text-white')}>
      <div className="flex items-center gap-1 mb-1 text-[9px] uppercase tracking-widest text-gray-400">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-xl font-bold leading-none">{value}</span>
        <span className="text-[10px] text-gray-500 mb-0.5">{unit}</span>
      </div>
    </div>
  );
}

export function ICUPatientGrid({ patients }: Props) {
  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/20 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Live Patient Grid</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map(p => (
            <div key={p.id} className={cn("p-4 rounded-xl border relative overflow-hidden transition-all", p.status === 'critical' ? 'border-emergency/50 bg-emergency/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : p.status === 'warning' ? 'border-warning/30 bg-warning/5' : 'border-white/[0.06] bg-surface-dark')}>
               {p.status === 'critical' && <div className="absolute top-0 left-0 w-full h-1 bg-emergency animate-pulse" />}
               
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h4 className="text-lg font-bold text-white leading-tight">{p.bed}</h4>
                   <span className="text-xs text-gray-400 font-mono">{p.name} | {p.diagnosis}</span>
                 </div>
                 {p.activeAlerts > 0 && (
                   <span className="text-[10px] font-bold bg-emergency text-white px-2 py-1 rounded animate-pulse">
                     {p.activeAlerts} ALERTS
                   </span>
                 )}
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <VitalBlock icon={HeartPulse} label="HR" value={p.vitals.hr} unit="bpm" status={p.vitals.hr > 120 ? 'critical' : undefined} />
                 <VitalBlock icon={Activity} label="BP" value={p.vitals.bp} unit="mmHg" status={parseInt(p.vitals.bp.split('/')[0]) < 90 ? 'critical' : undefined} />
                 <VitalBlock icon={Wind} label="SpO2" value={p.vitals.spo2} unit="%" status={p.vitals.spo2 < 92 ? 'critical' : undefined} />
                 <VitalBlock icon={Droplet} label="Resp" value={p.vitals.resp} unit="/min" status={p.vitals.resp > 25 ? 'warning' : undefined} />
               </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
