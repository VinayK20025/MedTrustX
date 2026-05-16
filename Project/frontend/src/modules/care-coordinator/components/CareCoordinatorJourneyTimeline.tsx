'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CoordinatedPatient, CareMilestone } from '../types/careCoordinator.types';
import { Route, CheckCircle2, CircleDashed, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: CoordinatedPatient; milestones: CareMilestone[]; }

export function CareCoordinatorJourneyTimeline({ activePatient, milestones }: Props) {
  if (!activePatient) return null;

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#05050a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-indigo-400">PATIENT JOURNEY MAP</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Patient: {activePatient.mrn}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        {/* Patient Clinical Summary */}
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-[11px]">
           <div>
              <span className="block text-gray-500 mb-1">Attending Physician</span>
              <span className="text-white font-bold">Dr. {activePatient.attendingPhysician}</span>
           </div>
           <div className="text-right">
              <span className="block text-gray-500 mb-1">Current Ward</span>
              <span className="text-white font-bold">{activePatient.currentWard}</span>
           </div>
        </div>

        {/* Vertical Journey Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative border-l-2 border-white/[0.05] ml-4 space-y-8">
            {milestones.map((m, idx) => (
              <div key={m.id} className="relative pl-6">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[13px] top-0.5 bg-[#05050a] p-1">
                  {m.status === 'Completed' ? <CheckCircle2 className="w-5 h-5 text-success-light" /> : 
                   m.status === 'Delayed' ? <AlertTriangle className="w-5 h-5 text-emergency-light" /> : 
                   <CircleDashed className="w-5 h-5 text-gray-500" />}
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={cn("text-[14px] font-bold mb-1", 
                       m.status === 'Completed' ? "text-gray-300" :
                       m.status === 'Delayed' ? "text-emergency-light" : "text-white"
                    )}>
                      {m.title}
                    </h4>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">{m.phase}</span>
                    
                    {m.notes && (
                      <div className="bg-black/30 p-2 rounded text-[11px] text-gray-400 border border-white/5 mb-2 mt-1">
                        {m.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono text-gray-300">{m.assignedTeam}</span>
                    {m.timestamp && <span className="text-[10px] text-gray-500 font-mono mt-1">{new Date(m.timestamp).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
