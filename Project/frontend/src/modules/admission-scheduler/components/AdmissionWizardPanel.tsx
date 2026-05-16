'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AdmissionStep, BedUnit } from '../types/admissionScheduler.types';
import { useSubmitAdmission } from '../hooks/useAdmissionSchedulerAnalytics';
import { ClipboardPlus, User, FileText, BedDouble, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { beds: BedUnit[]; }

const STEPS: { key: AdmissionStep; label: string; icon: React.ReactNode }[] = [
  { key: 'patient', label: 'Patient', icon: <User className="w-3.5 h-3.5" /> },
  { key: 'details', label: 'Details', icon: <FileText className="w-3.5 h-3.5" /> },
  { key: 'bed', label: 'Bed', icon: <BedDouble className="w-3.5 h-3.5" /> },
  { key: 'insurance', label: 'Insurance', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { key: 'confirm', label: 'Confirm', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

const bedStatusStyle: Record<BedUnit['status'], { bg: string; text: string; ring: string }> = {
  Available: { bg: 'bg-success/15 hover:bg-success/25', text: 'text-success-light', ring: 'border-success/30 hover:border-success/50' },
  Occupied:  { bg: 'bg-emergency/10', text: 'text-emergency-light', ring: 'border-emergency/20' },
  Cleaning:  { bg: 'bg-warning/10', text: 'text-warning-light', ring: 'border-warning/20' },
  Reserved:  { bg: 'bg-indigo-500/10', text: 'text-indigo-300', ring: 'border-indigo-500/20' },
};

export function AdmissionWizardPanel({ beds }: Props) {
  const [step, setStep] = useState(0);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  const { mutate: submit, isPending } = useSubmitAdmission();
  const currentStep = STEPS[step];

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  return (
    <Card className="border-emerald-500/25 shadow-glass bg-[#040a06] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />

      {/* Step Indicator */}
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ClipboardPlus className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">ADMISSION WIZARD</h3>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div onClick={() => setStep(i)} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all',
                i === step ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                i < step ? 'bg-success/10 text-success-light' : 'bg-white/5 text-gray-500'
              )}>
                {s.icon} {s.label}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {/* Step 1: Patient */}
          {currentStep.key === 'patient' && (
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Search Patient (Phone / MRN)</label>
              <input type="text" placeholder="Enter phone or MRN..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50" />
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-[12px] text-gray-400">
                <p className="text-white font-bold mb-2">Anita Sharma</p>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <span>MRN: MRN-9901</span><span>Age: 34 / Female</span>
                  <span>Phone: 9876****10</span><span>ID: Aadhaar</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep.key === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Admission Type</label>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold text-[12px]">Planned</button>
                  <button className="flex-1 py-3 rounded-lg border border-white/10 bg-white/5 text-gray-400 font-bold text-[12px] hover:bg-white/10">Emergency</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Department</label>
                <select className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50 appearance-none">
                  <option>Cardiology</option><option>Orthopedics</option><option>Neurology</option><option>General Surgery</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Attending Doctor</label>
                <select className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50 appearance-none">
                  <option>Dr. Meera Iyer</option><option>Dr. Sanjay Patel</option><option>Dr. Emily Chen</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Reason for Admission</label>
                <textarea rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50 resize-none" placeholder="Brief reason..." />
              </div>
            </div>
          )}

          {/* Step 3: Bed Allocation */}
          {currentStep.key === 'bed' && (
            <div className="space-y-4">
              <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1 text-success-light"><span className="w-2 h-2 rounded-full bg-success-500" /> Available</span>
                <span className="flex items-center gap-1 text-emergency-light"><span className="w-2 h-2 rounded-full bg-emergency-500" /> Occupied</span>
                <span className="flex items-center gap-1 text-warning-light"><span className="w-2 h-2 rounded-full bg-warning-500" /> Cleaning</span>
                <span className="flex items-center gap-1 text-indigo-300"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Reserved</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {beds.map(bed => {
                  const s = bedStatusStyle[bed.status];
                  const isSelected = selectedBed === bed.id;
                  return (
                    <div
                      key={bed.id}
                      onClick={() => bed.status === 'Available' && setSelectedBed(bed.id)}
                      className={cn('p-3 rounded-lg border text-center transition-all', s.bg, s.ring,
                        bed.status === 'Available' ? 'cursor-pointer' : 'cursor-default',
                        isSelected && 'ring-2 ring-emerald-400 border-emerald-400'
                      )}
                    >
                      <span className={cn('text-[12px] font-mono font-bold block', s.text)}>{bed.label}</span>
                      <span className="text-[9px] text-gray-500 block mt-0.5">{bed.ward}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Insurance */}
          {currentStep.key === 'insurance' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Insurance Provider</label>
                <select className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50 appearance-none">
                  <option>None / Self-Pay</option><option>Star Health</option><option>ICICI Lombard</option><option>HDFC Ergo</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Policy Number</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50" placeholder="Policy #" />
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-[11px] text-gray-400">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Pre-Authorization Status</span>
                <span className="text-warning-light font-bold bg-warning/10 px-2 py-1 rounded">Pending Verification</span>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep.key === 'confirm' && (
            <div className="space-y-4">
              <h4 className="text-[12px] font-bold text-white uppercase tracking-widest">Admission Summary</h4>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5 space-y-3 text-[12px] font-mono">
                <div className="flex justify-between"><span className="text-gray-500">Patient</span><span className="text-white font-bold">Anita Sharma (MRN-9901)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="text-emerald-300">Planned</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Department</span><span className="text-white">Cardiology</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Doctor</span><span className="text-white">Dr. Meera Iyer</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Bed</span><span className="text-white">{selectedBed || 'ICU-01'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Insurance</span><span className="text-warning-light">Pending Verification</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
          <Button size="sm" disabled={step === 0} onClick={prev} className="h-9 bg-white/5 hover:bg-white/10 text-gray-300" leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={next} className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold" leftIcon={<ChevronRight className="w-4 h-4" />}>
              Next Step
            </Button>
          ) : (
            <Button size="sm" disabled={isPending} onClick={() => submit({ patientMrn: 'MRN-9901', patientName: 'Anita Sharma', admissionType: 'Planned', department: 'Cardiology', attendingDoctor: 'Dr. Meera Iyer', reason: 'Chest pain evaluation', bedId: selectedBed || 'BED-ICU-01', bedLabel: selectedBed || 'ICU-01' })} className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Confirm Admission
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
