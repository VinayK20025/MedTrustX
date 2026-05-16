'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { EhrPatient, EhrRecordData } from '../types/ehr.types';
import { useSaveEhrRecord } from '../hooks/useEhrAnalytics';
import { FileText, Save, History, UploadCloud, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patient?: EhrPatient; recordData?: EhrRecordData; onValidate: (data: EhrRecordData) => void; }

export function EhrWorkspace({ patient, recordData, onValidate }: Props) {
  const { mutate: saveRecord } = useSaveEhrRecord();
  const [activeTab, setActiveTab] = useState<'vitals' | 'notes'>('vitals');
  
  // Local form state
  const [vitals, setVitals] = useState({ bp: recordData?.vitals?.bp || '', hr: recordData?.vitals?.hr || '', temp: recordData?.vitals?.temp || '' });
  const [notes, setNotes] = useState(recordData?.diagnosis || '');

  if (!patient) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
      <FileText className="w-10 h-10 text-gray-600 mb-4" />
      <p className="text-gray-500 text-[15px]">Select a patient to enter clinical data</p>
    </Card>
  );

  const handleDataChange = () => {
    // Whenever data changes, trigger validation to parent
    onValidate({ vitals, diagnosis: notes });
  };

  const handleSave = () => {
    saveRecord({ id: patient.id, data: { vitals, diagnosis: notes } });
  };

  return (
    <Card className="border-blue-500/25 shadow-glass bg-[#030612] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-[18px] font-bold text-white">{patient.name} <span className="text-[14px] text-gray-500 font-normal ml-2">{patient.age}yrs / {patient.gender}</span></h3>
            <p className="text-[12px] text-blue-300 font-mono mt-1">{patient.uhid} • {patient.department}</p>
          </div>
          <Button onClick={handleSave} size="sm" className="bg-success/20 hover:bg-success/30 text-success-light border border-success/30 px-4 h-8 text-[11px]" leftIcon={<Save className="w-3.5 h-3.5" />}>Secure Save</Button>
        </div>

        {/* Workspace Tabs */}
        <div className="flex gap-4 mt-4 border-b border-white/10">
          <button onClick={() => setActiveTab('vitals')} className={cn("pb-2 text-[12px] font-bold uppercase tracking-wider transition-colors", activeTab === 'vitals' ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500 hover:text-gray-300")}>Vitals & Input</button>
          <button onClick={() => setActiveTab('notes')} className={cn("pb-2 text-[12px] font-bold uppercase tracking-wider transition-colors", activeTab === 'notes' ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500 hover:text-gray-300")}>Clinical Notes</button>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {activeTab === 'vitals' && (
           <div className="p-5 space-y-5 animate-fade-in">
             <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Activity className="w-3 h-3" /> Standard Vitals</h4>
             <div className="grid grid-cols-3 gap-4">
               <div>
                 <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Blood Pressure</label>
                 <input type="text" value={vitals.bp} onChange={e => {setVitals({...vitals, bp: e.target.value}); handleDataChange();}} placeholder="120/80" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] font-mono text-white focus:border-blue-500/50 outline-none" />
               </div>
               <div>
                 <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Heart Rate (bpm)</label>
                 <input type="number" value={vitals.hr} onChange={e => {setVitals({...vitals, hr: e.target.value}); handleDataChange();}} placeholder="72" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] font-mono text-white focus:border-blue-500/50 outline-none" />
               </div>
               <div>
                 <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Temp (°F)</label>
                 <input type="number" value={vitals.temp} onChange={e => {setVitals({...vitals, temp: e.target.value}); handleDataChange();}} placeholder="98.6" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] font-mono text-white focus:border-blue-500/50 outline-none" />
               </div>
             </div>
           </div>
        )}

        {activeTab === 'notes' && (
           <div className="p-5 flex-1 flex flex-col animate-fade-in">
             <div className="flex justify-between items-center mb-3">
               <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><FileText className="w-3 h-3" /> Diagnosis & Observation</h4>
               <Button size="sm" className="bg-white/5 hover:bg-white/10 text-[10px] h-6 px-2 text-gray-400" leftIcon={<UploadCloud className="w-3 h-3" />}>Load Template</Button>
             </div>
             <textarea 
                value={notes} onChange={e => {setNotes(e.target.value); handleDataChange();}} 
                placeholder="Enter structured clinical observations..."
                className="w-full flex-1 bg-white/[0.02] border border-white/10 rounded-lg p-4 text-[13px] text-gray-200 focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
             />
           </div>
        )}
      </CardBody>
    </Card>
  );
}
