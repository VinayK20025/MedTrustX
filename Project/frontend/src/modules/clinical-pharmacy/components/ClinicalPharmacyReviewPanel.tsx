'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PatientReviewData, MedicationOrder } from '../types/clinicalPharmacy.types';
import { useSubmitIntervention, useMarkAsReviewed } from '../hooks/useClinicalPharmacyAnalytics';
import { Pill, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: PatientReviewData; medications: MedicationOrder[]; }

export function ClinicalPharmacyReviewPanel({ activePatient, medications }: Props) {
  const { mutate: markReviewed, isPending } = useMarkAsReviewed();

  if (!activePatient) return null;

  return (
    <Card className="border-blue-500/30 shadow-glass bg-[#05050a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-blue-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-blue-400">MEDICATION THERAPY REVIEW</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Patient: {activePatient.mrn}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        {/* Patient Clinical Summary */}
        <div className="p-4 bg-white/[0.02] border-b border-white/5 grid grid-cols-2 gap-4 text-[11px]">
           <div>
              <span className="block text-gray-500 mb-1">Primary Diagnosis</span>
              <span className="text-white font-bold">{activePatient.diagnosis}</span>
           </div>
           <div>
              <span className="block text-gray-500 mb-1">Allergies</span>
              {activePatient.allergies.length > 0 ? (
                <span className="text-emergency-light font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> {activePatient.allergies.join(', ')}</span>
              ) : (
                <span className="text-gray-400">NKA</span>
              )}
           </div>
        </div>

        {/* Medication List */}
        <div className="divide-y divide-white/[0.03] flex-1 overflow-y-auto">
          {medications.map(med => (
            <div key={med.id} className="p-5 hover:bg-white/[0.015] transition-colors border-l-2 border-transparent hover:border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {med.drugName}
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">{med.dosage} {med.route} {med.frequency}</span>
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Prescribed by {med.prescribedBy}</p>
                </div>
                {med.flags.length > 0 && (
                  <div className="flex flex-col gap-1 items-end">
                    {med.flags.map(f => (
                      <span key={f} className="text-[9px] uppercase font-bold text-warning-light bg-warning/20 px-1.5 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end gap-3 items-center">
          <Button size="sm" className="bg-surface-dark border border-white/10 text-gray-300 hover:text-white h-9">Propose Intervention</Button>
          <Button 
            disabled={isPending} 
            onClick={() => markReviewed(activePatient.id)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-9"
            leftIcon={<CheckCircle2 className="w-4 h-4"/>}
          >
            Mark as Reviewed
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
