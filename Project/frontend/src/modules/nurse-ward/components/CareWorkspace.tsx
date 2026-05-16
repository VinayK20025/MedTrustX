'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { WardPatient, MedicationTask, CareTask, PatientVitals } from '../types/nurse-ward.types';
import { useAdministerMedication, useCompleteCareTask, useRecordVitals } from '../hooks/useNurseWardAnalytics';
import { User, Activity, Pill, CheckSquare, ScanBarcode, AlertCircle, HeartPulse, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patient?: WardPatient; meds: MedicationTask[]; tasks: CareTask[]; vitals: PatientVitals[]; }

export function CareWorkspace({ patient, meds, tasks, vitals }: Props) {
  const { mutate: adminMed } = useAdministerMedication();
  const { mutate: completeTask } = useCompleteCareTask();
  const { mutate: recordVitals } = useRecordVitals();
  
  const [tab, setTab] = useState<'meds' | 'tasks' | 'vitals'>('meds');
  const [scanValue, setScanValue] = useState('');

  if (!patient) {
    return (
      <Card className="border-blue-500/20 shadow-glass bg-[#020406] h-full flex items-center justify-center">
        <div className="text-center opacity-40">
          <User className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Select a patient to access bedside care workspace.</p>
        </div>
      </Card>
    );
  }

  const pMeds = meds.filter(m => m.patientId === patient.id);
  const pTasks = tasks.filter(t => t.patientId === patient.id);
  const pVitals = vitals.filter(v => v.patientId === patient.id).sort((a,b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  const latestVitals = pVitals[0];

  return (
    <Card className="border-blue-500/20 shadow-glass bg-[#020406] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-500" />

      <CardHeader className="border-b border-white/[0.04] p-5 pb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{patient.mrn}</span>
          <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-1 rounded border border-white/10">{patient.bed}</span>
        </div>
        <h3 className="text-[22px] font-black text-white leading-tight">{patient.name}</h3>
        <p className="text-[12px] text-gray-400 mt-1">{patient.age}y • {patient.gender} • {patient.diagnosis}</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('meds')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'meds' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><Pill className="w-3.5 h-3.5" /> Medications</button>
        <button onClick={() => setTab('vitals')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'vitals' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><HeartPulse className="w-3.5 h-3.5" /> Vitals Flowsheet</button>
        <button onClick={() => setTab('tasks')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'tasks' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><CheckSquare className="w-3.5 h-3.5" /> Care Tasks</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* MEDS TAB */}
        {tab === 'meds' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {/* SCANNER BAR */}
            <div className="bg-black/40 border border-white/[0.05] p-3 rounded-xl flex gap-2 mb-4">
              <div className="relative flex-1">
                <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input type="text" placeholder="Scan Patient Wristband or Medication Barcode..." value={scanValue} onChange={e => setScanValue(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg h-10 pl-9 pr-3 text-[13px] text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <Button className="h-10 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40">Verify Match</Button>
            </div>

            {pMeds.length === 0 ? <p className="text-[12px] text-gray-500 italic">No medications scheduled.</p> : pMeds.map(med => (
              <div key={med.id} className={cn('bg-white/[0.02] border rounded-xl p-4 transition-colors',
                med.status === 'Missed' ? 'border-emergency/30 bg-emergency/[0.03]' : 'border-white/10 hover:bg-white/[0.04]'
              )}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[14px] font-bold text-white">{med.drug} <span className="text-[12px] font-mono text-blue-300 ml-1">{med.dosage}</span></h4>
                  <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider',
                    med.status === 'Missed' ? 'bg-emergency/15 text-emergency-light' : 
                    med.status === 'Administered' ? 'bg-success/15 text-success-light' : 'bg-warning/15 text-warning-light'
                  )}>{med.status}</span>
                </div>
                
                <p className="text-[11px] text-gray-400 mb-4">Route: <span className="text-white">{med.route}</span> • Scheduled: <span className={cn(med.status === 'Missed' && 'text-emergency-light')}>{new Date(med.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>

                {med.status !== 'Administered' && (
                  <Button onClick={() => adminMed(med.id)} className="w-full h-9 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[12px]" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>Mark Administered</Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VITALS TAB */}
        {tab === 'vitals' && (
          <div className="p-5 animate-fade-in">
            {latestVitals && (
               <div className={cn('rounded-xl p-5 mb-5 border', latestVitals.isAbnormal ? 'bg-emergency/10 border-emergency/30' : 'bg-black/30 border-white/10')}>
                 <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">Latest Vitals ({new Date(latestVitals.recordedAt).toLocaleTimeString()})</p>
                 <div className="grid grid-cols-4 gap-4">
                   <div>
                     <p className="text-[10px] text-gray-400 mb-1">BP (mmHg)</p>
                     <p className={cn('text-xl font-black font-mono', latestVitals.isAbnormal ? 'text-emergency-light' : 'text-white')}>{latestVitals.bp}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-400 mb-1">HR (bpm)</p>
                     <p className={cn('text-xl font-black font-mono', latestVitals.isAbnormal ? 'text-emergency-light' : 'text-white')}>{latestVitals.hr}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-400 mb-1">Temp (°F)</p>
                     <p className="text-xl font-black font-mono text-white">{latestVitals.temp}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-400 mb-1">SpO2 (%)</p>
                     <p className="text-xl font-black font-mono text-white">{latestVitals.spo2}</p>
                   </div>
                 </div>
               </div>
            )}
            
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">Record New Vitals</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input type="text" placeholder="BP (e.g. 120/80)" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-[13px] text-white" />
                <input type="number" placeholder="Heart Rate" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-[13px] text-white" />
                <input type="number" placeholder="Temperature (°F)" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-[13px] text-white" />
                <input type="number" placeholder="SpO2 (%)" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-[13px] text-white" />
              </div>
              <Button onClick={() => recordVitals({ id: patient.id, payload: {} })} className="w-full h-10 bg-white/10 hover:bg-white/20 text-white border-transparent">Save to EHR</Button>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {pTasks.length === 0 ? <p className="text-[12px] text-gray-500 italic">No pending tasks.</p> : pTasks.map(t => (
              <div key={t.id} className={cn('bg-white/[0.02] border rounded-xl p-4 flex items-center justify-between transition-colors',
                t.status === 'Completed' ? 'opacity-50 grayscale' : 'hover:bg-white/[0.04]',
                t.priority === 'High' && t.status !== 'Completed' ? 'border-emergency/30 bg-emergency/[0.02]' : 'border-white/10'
              )}>
                <div className="flex items-start gap-3">
                  <button onClick={() => completeTask(t.id)} disabled={t.status === 'Completed'} className={cn('mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
                    t.status === 'Completed' ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 hover:border-blue-500'
                  )}>
                    {t.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <div>
                    <h4 className={cn('text-[14px] font-bold mb-0.5', t.status === 'Completed' ? 'text-gray-400 line-through' : 'text-white')}>{t.task}</h4>
                    <div className="flex gap-2 text-[10px]">
                      {t.priority === 'High' && <span className="text-emergency-light font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> HIGH PRIORITY</span>}
                      <span className="text-gray-500">Timeframe: {t.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
