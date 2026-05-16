'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CriticalPatient } from '../types/er.types';
import { HeartPulse, Activity } from 'lucide-react';

interface Props { patients: CriticalPatient[]; }

export function CriticalPatientPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emergency-light animate-pulse" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Critical Patients</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[500px]">
        {patients.map(p => {
          const bpSys = parseInt(p.vitals.bp.split('/')[0] || '0');
          const isCrashing = bpSys < 90 || p.vitals.spo2 < 90;
          
          return (
            <div key={p.id} className={`p-3 rounded-lg border ${isCrashing ? 'border-emergency/40 bg-emergency/10' : 'border-white/[0.04] bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{p.patientName}</p>
                  <p className="text-[10px] text-gray-400">{p.diagnosis} • <span className="text-indigo-300 font-mono">{p.location}</span></p>
                </div>
                {isCrashing && <span className="text-[9px] bg-emergency text-white px-2 py-0.5 rounded animate-pulse font-bold">CRASHING</span>}
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-4 gap-1 bg-black/20 rounded p-1.5 mb-2">
                <div className="text-center"><p className="text-[8px] text-gray-500 uppercase">HR</p><p className={`text-[11px] font-mono font-bold ${p.vitals.hr > 120 ? 'text-emergency-light' : 'text-gray-300'}`}>{p.vitals.hr}</p></div>
                <div className="text-center"><p className="text-[8px] text-gray-500 uppercase">BP</p><p className={`text-[11px] font-mono font-bold ${bpSys < 90 ? 'text-emergency-light animate-pulse' : 'text-gray-300'}`}>{p.vitals.bp}</p></div>
                <div className="text-center"><p className="text-[8px] text-gray-500 uppercase">SpO2</p><p className={`text-[11px] font-mono font-bold ${p.vitals.spo2 < 92 ? 'text-emergency-light' : 'text-teal-300'}`}>{p.vitals.spo2}%</p></div>
                <div className="text-center"><p className="text-[8px] text-gray-500 uppercase">GCS/RR</p><p className="text-[11px] font-mono font-bold text-gray-300">{p.vitals.gcs || p.vitals.rr}</p></div>
              </div>

              {/* Alerts & Interventions */}
              <div className="space-y-1 mb-3">
                {p.alerts.map((a, i) => <p key={`a-${i}`} className="text-[9px] text-emergency-light bg-emergency/10 px-1.5 py-0.5 rounded truncate">⚠ {a}</p>)}
                {p.interventions.map((inv, i) => <p key={`i-${i}`} className="text-[9px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded truncate">✓ {inv}</p>)}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-7 text-[10px]">Open Case</Button>
                <Button size="sm" variant="outline" className="flex-1 border-white/10 hover:bg-white/5 h-7 text-[10px]">Orders</Button>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
