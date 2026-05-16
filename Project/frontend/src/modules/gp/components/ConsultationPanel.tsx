'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CurrentConsultation } from '../types/gp.types';
import { Stethoscope, AlertTriangle, Thermometer, Activity, Heart } from 'lucide-react';

interface Props { consultation: CurrentConsultation | null; }

function VitalSmall({ icon: Icon, label, value, danger }: { icon: any; label: string; value: string | number; danger?: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded bg-white/[0.02] border ${danger ? 'border-emergency/30 bg-emergency/5 text-emergency-light' : 'border-white/[0.04] text-gray-300'}`}>
      <Icon className="w-4 h-4" />
      <div>
        <p className="text-[9px] uppercase tracking-wider text-gray-500">{label}</p>
        <p className={`text-xs font-bold font-mono ${danger ? 'animate-pulse' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

export function ConsultationPanel({ consultation: c }: Props) {
  if (!c) return <Card className="h-full flex items-center justify-center text-gray-500">No active consultation</Card>;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
            {c.patientName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">{c.patientName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{c.age} yrs • {c.gender} • ID: {c.patientId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {c.allergies.map(a => <span key={a} className="text-[10px] text-emergency-light bg-emergency/10 border border-emergency/20 px-2 py-1 rounded font-bold">⚠ ALLERGY: {a}</span>)}
        </div>
      </CardHeader>
      <CardBody className="p-5 flex-1 space-y-6">
        {/* Vitals */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Triage Vitals</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <VitalSmall icon={Thermometer} label="Temp" value={`${c.vitals.temp}°C`} danger={c.vitals.temp! >= 38} />
            <VitalSmall icon={Activity} label="BP" value={c.vitals.bp || '--'} danger={parseInt(c.vitals.bp?.split('/')[0] || '0') >= 140} />
            <VitalSmall icon={Heart} label="HR" value={c.vitals.hr || '--'} />
            <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/[0.04] text-gray-300">
              <span className="text-teal-400 font-bold text-sm">O₂</span>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-gray-500">SpO2</p>
                <p className="text-xs font-bold font-mono">{c.vitals.spo2}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chief Complaint */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Chief Complaint</h4>
          <p className="text-sm text-gray-200 bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">{c.chiefComplaint}</p>
        </div>

        {/* Quick Input (Notes) */}
        <div className="flex-1 flex flex-col">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5" /> Clinical Notes
          </h4>
          <textarea 
            className="w-full flex-1 bg-surface-dark border border-white/[0.08] rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none min-h-[150px]"
            placeholder="Type subjective, objective, assessment, and plan (SOAP)..."
          ></textarea>
        </div>
      </CardBody>
    </Card>
  );
}
