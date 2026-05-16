'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { QueuedPatient, PrescriptionItem } from '../types/telemedicine.types';
import { useEndConsultation, useSendPrescription } from '../hooks/useTelemedicineAnalytics';
import { Video, VideoOff, Mic, MicOff, Monitor, PhoneOff, Pill, Send, Plus, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patient?: QueuedPatient; templates: PrescriptionItem[]; }

interface WorkspaceProps {
  patient?: QueuedPatient;
  templates: PrescriptionItem[];
  initialTab?: 'consult' | 'prescribe';
}

export function ConsultationWorkspace({ patient, templates, initialTab = 'consult' }: WorkspaceProps) {
  const { mutate: endConsult } = useEndConsultation();
  const { mutate: sendRx } = useSendPrescription();
  const [tab, setTab] = useState<'consult' | 'prescribe'>(initialTab);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [selectedRx, setSelectedRx] = useState<string[]>([]);

  const isLive = patient?.status === 'In Consult';

  return (
    <Card className="border-sky-500/20 shadow-glass bg-[#020408] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-800 via-blue-500 to-cyan-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex justify-between items-start">
        <div>
          <h3 className="text-[16px] font-black text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-sky-400" /> Virtual Consultation
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Encrypted video/audio • EHR context auto-loaded • E-Rx ready</p>
        </div>
        {isLive && (
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded flex items-center gap-1.5 animate-pulse border border-emerald-500/30">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" /> LIVE
          </span>
        )}
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('consult')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'consult' ? 'text-sky-400 border-sky-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Consultation</button>
        <button onClick={() => setTab('prescribe')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'prescribe' ? 'text-sky-400 border-sky-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>E-Prescription</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">

        {tab === 'consult' && (
          <div className="flex flex-col h-full">
            {!patient ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <Video className="w-12 h-12 text-sky-500 mb-3" />
                <p className="text-gray-400 font-bold">Select a patient to start consultation.</p>
              </div>
            ) : (
              <>
                {/* Video Area */}
                <div className="flex-1 bg-black/80 relative flex items-center justify-center min-h-[300px]">
                  <div className="text-center opacity-30">
                    <Monitor className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-[12px] font-bold">
                      {isLive ? 'Video feed active — patient connected' : 'Waiting for patient to join...'}
                    </p>
                  </div>
                  {/* Self-view pip */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-900 border border-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] text-gray-500">You</span>
                  </div>
                  {/* Connection quality */}
                  {patient.connectionQuality === 'Poor' && (
                    <div className="absolute top-4 right-4 bg-emergency/20 border border-emergency/40 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-emergency-light">
                      <AlertTriangle className="w-3 h-3" /> Poor Connection — Consider Audio Only
                    </div>
                  )}
                </div>

                {/* Patient Context */}
                <div className="p-4 border-t border-white/5 bg-black/60">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-[16px] font-bold text-white">{patient.name}</h4>
                      <p className="text-[11px] text-gray-400">{patient.age}y {patient.gender} • {patient.complaint}</p>
                    </div>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <span className="text-[10px] font-bold text-emergency-light bg-emergency/10 px-2 py-1 rounded border border-emergency/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {patient.allergies.join(', ')}</span>
                    )}
                  </div>
                </div>

                {/* Call Controls */}
                <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-center gap-4">
                  <button onClick={() => setMicOn(!micOn)} className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-colors', micOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-emergency/20 text-emergency-light')}>
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setVideoOn(!videoOn)} className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-colors', videoOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-emergency/20 text-emergency-light')}>
                    {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                  {isLive && (
                    <button onClick={() => endConsult(patient.id)} className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors">
                      <PhoneOff className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'prescribe' && (
          <div className="p-5 flex flex-col gap-5">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Prescription Templates</p>
              <div className="space-y-2">
                {templates.map(rx => (
                  <div key={rx.id} onClick={() => setSelectedRx(prev => prev.includes(rx.id) ? prev.filter(x => x !== rx.id) : [...prev, rx.id])}
                    className={cn('p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all',
                      selectedRx.includes(rx.id) ? 'bg-sky-500/10 border-sky-500/40 text-sky-300' : 'bg-white/[0.02] border-white/10 text-white hover:bg-white/[0.05]'
                    )}>
                    <Pill className={cn('w-5 h-5 shrink-0', selectedRx.includes(rx.id) ? 'text-sky-400' : 'text-gray-500')} />
                    <div className="flex-1">
                      <span className="text-[13px] font-bold block">{rx.drug}</span>
                      <span className="text-[10px] text-gray-400">{rx.dose} • {rx.frequency} • {rx.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:bg-white/[0.04] transition-colors">
              <Plus className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-[11px] text-gray-500 font-bold">Add Custom Medication</p>
            </div>

            <Button disabled={selectedRx.length === 0} onClick={() => patient && sendRx({ id: patient.id, items: selectedRx })}
              className={cn('w-full h-12 text-[13px] font-bold border',
                selectedRx.length > 0 ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 hover:bg-sky-500/30' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
              )} leftIcon={<Send className="w-4 h-4" />}>
              Send E-Prescription ({selectedRx.length} items)
            </Button>
            <p className="text-[9px] text-gray-600 text-center">E-Rx will be digitally signed, sent to patient via SMS/email, and forwarded to linked pharmacy.</p>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
