'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PostOpPatient } from '../types/surgeon.types';
import { Activity, AlertTriangle } from 'lucide-react';

interface Props { patients: PostOpPatient[]; }

export function PostOpMonitoringPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-warning-light" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Post-Op Recovery</h3>
          <p className="text-xs text-gray-400 mt-0.5">{patients.length} active monitoring</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px]">
        {patients.map(p => (
          <div key={p.id} className={`p-3 rounded-lg border ${p.status === 'complication' ? 'border-emergency/30 bg-emergency/5' : 'border-white/[0.04] bg-white/[0.02]'}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-white">{p.patientName}</p>
                <p className="text-[10px] text-gray-500">Day {p.daysPostOp} • {p.procedure}</p>
              </div>
              {p.status === 'complication' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
            </div>
            
            <div className="grid grid-cols-4 gap-1 bg-black/20 rounded p-1.5 mb-2">
              <div className="text-center"><p className="text-[8px] text-gray-500 uppercase">HR</p><p className={`text-[10px] font-mono ${p.vitals.hr > 100 ? 'text-emergency-light' : 'text-gray-300'}`}>{p.vitals.hr}</p></div>
              <div className="text-center"><p className="text-[8px] text-gray-500 uppercase">BP</p><p className="text-[10px] font-mono text-gray-300">{p.vitals.bp}</p></div>
              <div className="text-center"><p className="text-[8px] text-gray-500 uppercase">Temp</p><p className={`text-[10px] font-mono ${p.vitals.temp > 38 ? 'text-emergency-light' : 'text-gray-300'}`}>{p.vitals.temp}</p></div>
              <div className="text-center"><p className="text-[8px] text-gray-500 uppercase">SpO2</p><p className="text-[10px] font-mono text-teal-300">{p.vitals.spo2}%</p></div>
            </div>

            {p.alerts.length > 0 && (
              <div className="space-y-1">
                {p.alerts.map((a, i) => <p key={i} className="text-[9px] text-emergency-light bg-emergency/10 px-1.5 py-0.5 rounded truncate">⚠ {a}</p>)}
              </div>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
