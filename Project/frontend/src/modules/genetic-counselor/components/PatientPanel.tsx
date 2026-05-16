'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Users, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { GeneticPatient } from '../types/genetic.types';

interface PatientPanelProps {
  patients: GeneticPatient[];
  onSelectPatient?: (id: string) => void;
  activePatientId?: string;
}

export const PatientPanel: React.FC<PatientPanelProps> = ({ patients, onSelectPatient, activePatientId }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader 
        title="Genetic Cases"
        icon={<Users className="w-4 h-4" />}
        action={
          <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-400 border border-white/10">
            {patients.length} Active
          </span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {patients.map((patient) => {
            const isHighRisk = patient.riskLevel === 'High';

            return (
              <div 
                key={patient.id} 
                onClick={() => onSelectPatient?.(patient.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02]",
                  activePatientId === patient.id ? "bg-white/[0.04] border-l-2 border-teal-500" : "border-l-2 border-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-white">{patient.name}</h4>
                    <p className="text-[10px] text-gray-500">{patient.mrn} • {patient.age}{patient.gender}</p>
                  </div>
                  <div className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                    isHighRisk ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-teal-500/10 border-teal-500/20 text-teal-400"
                  )}>
                    {patient.riskLevel} Risk
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mt-2 space-y-1">
                  <div className="truncate text-gray-300">
                    {patient.referralReason}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-gray-400">
                      {patient.status}
                    </span>
                    {patient.nextSessionDate && (
                      <div className="flex items-center gap-1 text-[10px] text-indigo-400">
                        <Clock className="w-3 h-3" />
                        {new Date(patient.nextSessionDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
