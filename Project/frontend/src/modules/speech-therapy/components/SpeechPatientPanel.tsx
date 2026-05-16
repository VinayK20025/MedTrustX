'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SpeechPatient } from '../types/speech.types';
import { Users, Ear, MessageCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: SpeechPatient[]; }

export function SpeechPatientPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/15"><Users className="w-4 h-4 text-sky-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Patient Caseload</h3>
        </div>
        <Button size="sm" className="bg-sky-600 hover:bg-sky-500 border-none text-white font-bold text-xs">
          New Patient
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[450px]">
        <div className="divide-y divide-white/[0.03]">
          {patients.map(patient => (
            <div key={patient.id} className="p-5 hover:bg-white/[0.015] transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-sm font-bold text-gray-300">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {patient.name}
                      <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{patient.mrn}</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{patient.diagnosis}</p>
                  </div>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  patient.therapyStatus === 'Active' ? 'bg-success/20 text-success-light' : 
                  patient.therapyStatus === 'Pending Assessment' ? 'bg-warning/20 text-warning-light' : 'bg-gray-500/20 text-gray-400'
                )}>
                  {patient.therapyStatus}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1"><Ear className="w-3 h-3" /> Comm. Level</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-sky-400">{patient.communicationLevel}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-400" /> Therapy Needs</span>
                  <p className="text-[10px] text-gray-300 mt-1 truncate">Speech / Language Focus</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>Next Session: {new Date(patient.nextSessionDate).toLocaleDateString()}</span>
                <span className="text-sky-300 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Full Profile <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
