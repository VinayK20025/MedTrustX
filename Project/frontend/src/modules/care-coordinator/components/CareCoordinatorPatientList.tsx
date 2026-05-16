'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CoordinatedPatient } from '../types/careCoordinator.types';
import { Users, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: CoordinatedPatient[]; }

export function CareCoordinatorPatientList({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Users className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Active Journeys</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {patients.map(p => (
            <div key={p.id} className={cn("p-5 transition-colors cursor-pointer", p.status === 'Blocked' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {p.patientName}
                    {p.status === 'Blocked' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 font-mono">
                    {p.mrn} <span>•</span> {p.currentWard}
                  </p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  p.priority === 'Critical' || p.priority === 'High' ? 'bg-emergency/20 text-emergency-light' : 'bg-blue-500/20 text-blue-400'
                )}>
                  {p.priority}
                </span>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-2">
                  <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded border", 
                     p.status === 'Blocked' ? 'text-emergency-400 border-emergency-500/30 bg-emergency-500/10' : 
                     p.status === 'Delayed' ? 'text-warning-400 border-warning-500/30 bg-warning-500/10' : 'text-success-400 border-success-500/30 bg-success-500/10'
                  )}>{p.status}</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
                  <Clock className="w-3 h-3" /> Admit: {new Date(p.admissionDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
