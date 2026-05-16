'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PatientSnapshot } from '../types/locum.types';
import { Activity, Clock, Pill } from 'lucide-react';

interface Props { snapshot: PatientSnapshot | null; }

export function PatientSnapshotPanel({ snapshot: s }: Props) {
  if (!s) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-2 bg-indigo-500/5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">{s.patientName}</h3>
            <p className="text-sm text-indigo-300 mt-0.5">{s.primaryDiagnosis}</p>
          </div>
          {s.allergies.length > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-emergency-light uppercase font-bold tracking-widest">Allergies</p>
              <p className="text-xs text-emergency-light/80">{s.allergies.join(', ')}</p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 space-y-6 overflow-y-auto">
        {/* Vitals & Alerts */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg">
             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-3 h-3"/> Latest Vitals</h4>
             <div className="grid grid-cols-2 gap-2 text-xs font-mono">
               <span className="text-gray-300">BP: <span className="text-white">{s.vitals.bp}</span></span>
               <span className="text-gray-300">HR: <span className="text-white">{s.vitals.hr}</span></span>
               <span className="text-gray-300">Temp: <span className="text-white">{s.vitals.temp}</span></span>
               <span className="text-gray-300">SpO2: <span className="text-teal-400">{s.vitals.spo2}%</span></span>
             </div>
           </div>
           
           <div className="bg-emergency/5 border border-emergency/20 p-3 rounded-lg">
             <h4 className="text-[10px] font-bold text-emergency-light uppercase tracking-widest mb-2 flex items-center gap-2">Alerts</h4>
             <ul className="list-disc pl-4 space-y-1">
               {s.alerts.map((a, i) => <li key={i} className="text-[11px] text-gray-200">{a}</li>)}
             </ul>
           </div>
        </div>

        {/* Current Plan */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Current Plan</h4>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg space-y-1.5">
             {s.currentPlan.map((p, i) => (
               <p key={i} className="text-sm text-indigo-200 flex gap-2"><span>•</span> {p}</p>
             ))}
          </div>
        </div>

        {/* Compressed History */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="w-3 h-3"/> Key History</h4>
          <div className="space-y-2 border-l-2 border-white/[0.1] pl-3 ml-1">
             {s.keyHistory.map((h, i) => (
               <div key={i}>
                 <p className="text-[10px] text-gray-500 font-mono">{h.date}</p>
                 <p className="text-xs text-gray-300">{h.event}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Active Meds */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Pill className="w-3 h-3"/> Active Medications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
             {s.activeMeds.map((m, i) => (
               <div key={i} className="bg-white/[0.02] border border-white/[0.04] p-2 rounded flex justify-between items-center">
                 <div>
                   <p className="text-xs font-bold text-white">{m.name}</p>
                   <p className="text-[10px] text-gray-400">{m.dosage}</p>
                 </div>
                 <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">{m.schedule}</span>
               </div>
             ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
