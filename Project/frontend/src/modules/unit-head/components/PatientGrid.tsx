'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import type { BedPatient } from '../types/unit-head.types';
import { Wind } from 'lucide-react';

interface Props { patients: BedPatient[]; }

const severityBorder: Record<string, string> = {
  critical: 'border-emergency animate-pulse',
  serious:  'border-warning',
  moderate: 'border-indigo-500/40',
  stable:   'border-success/40',
};
const severityDot: Record<string, string> = {
  critical: 'bg-emergency animate-pulse',
  serious:  'bg-warning',
  moderate: 'bg-indigo-400',
  stable:   'bg-success',
};

function VitalChip({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className={`text-center ${danger ? 'text-emergency-light' : 'text-gray-300'}`}>
      <p className="text-[9px] text-gray-500 uppercase tracking-widest">{label}</p>
      <p className={`text-xs font-black font-mono ${danger ? 'animate-pulse' : ''}`}>{value}</p>
    </div>
  );
}

export function PatientGrid({ patients }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {patients.map(p => {
        const spo2Danger = p.vitals.spo2 < 92;
        const hrDanger = p.vitals.hr > 120 || p.vitals.hr < 50;
        const bpDanger = parseInt(p.vitals.bp.split('/')[0]) < 90;
        const tempDanger = p.vitals.temp > 38.5;
        const gcsDanger = p.vitals.gcs !== undefined && p.vitals.gcs < 12;

        return (
          <Card key={p.id} className={`border-2 ${severityBorder[p.severity]} bg-surface-light p-3 hover:bg-white/[0.03] transition-all cursor-pointer group relative overflow-hidden`}>
            {/* Severity indicator */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${severityDot[p.severity]}`} />
                <span className="text-xs font-bold text-white">{p.bed}</span>
              </div>
              <div className="flex items-center gap-1">
                {p.ventilator && <Wind className="w-3.5 h-3.5 text-indigo-400" title="Ventilator" />}
                {p.alerts.length > 0 && (
                  <span className="text-[9px] text-emergency-light bg-emergency/10 px-1.5 py-0.5 rounded-full font-bold animate-pulse">{p.alerts.length}!</span>
                )}
              </div>
            </div>

            {/* Patient */}
            <h4 className="text-sm font-semibold text-white truncate">{p.name}</h4>
            <p className="text-[10px] text-gray-500 truncate mb-2">{p.diagnosis}</p>

            {/* Vitals Grid */}
            <div className="grid grid-cols-5 gap-1 bg-white/[0.02] rounded-lg p-2 mb-2">
              <VitalChip label="HR" value={p.vitals.hr} danger={hrDanger} />
              <VitalChip label="BP" value={p.vitals.bp} danger={bpDanger} />
              <VitalChip label="SpO2" value={`${p.vitals.spo2}%`} danger={spo2Danger} />
              <VitalChip label="RR" value={p.vitals.rr} />
              <VitalChip label={p.vitals.gcs !== undefined ? 'GCS' : 'Temp'} value={p.vitals.gcs !== undefined ? p.vitals.gcs : `${p.vitals.temp}°`} danger={gcsDanger || tempDanger} />
            </div>

            {/* Alerts */}
            {p.alerts.length > 0 && (
              <div className="space-y-0.5">
                {p.alerts.slice(0, 2).map((a, i) => (
                  <p key={i} className="text-[9px] text-emergency-light bg-emergency/5 px-1.5 py-0.5 rounded truncate">⚠ {a}</p>
                ))}
              </div>
            )}

            {/* Staff */}
            <div className="flex gap-x-3 text-[9px] text-gray-500 mt-2">
              <span>{p.attendingDoctor}</span>
              <span>{p.nurse}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
