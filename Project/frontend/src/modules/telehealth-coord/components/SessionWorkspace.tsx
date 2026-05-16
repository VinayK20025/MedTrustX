'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DoctorSlot, SessionIssue } from '../types/telehealth-coord.types';
import { useResolveIssue } from '../hooks/useTelehealthCoordAnalytics';
import { Monitor, UserCheck, Wifi, WifiOff, AlertTriangle, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { doctors: DoctorSlot[]; issues: SessionIssue[]; }

const docStatusColor: Record<string, string> = { Available: 'text-emerald-400', 'In Consult': 'text-blue-400', Offline: 'text-gray-500' };
const docStatusBg: Record<string, string> = { Available: 'bg-emerald-500/15', 'In Consult': 'bg-blue-500/15', Offline: 'bg-gray-500/15' };

export function SessionWorkspace({ doctors, issues }: Props) {
  const { mutate: resolveIssue } = useResolveIssue();
  const [tab, setTab] = useState<'doctors' | 'issues'>('doctors');

  return (
    <Card className="border-cyan-500/20 shadow-glass bg-[#020406] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-800 via-sky-500 to-blue-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Monitor className="w-5 h-5 text-cyan-400" /> Telehealth Operations Center
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Monitor doctor availability, manage session issues, and ensure seamless virtual care delivery.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('doctors')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'doctors' ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Doctor Availability</button>
        <button onClick={() => setTab('issues')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'issues' ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Issues
          {issues.filter(i => i.status === 'Open').length > 0 && (
            <span className="ml-1.5 bg-emergency/20 text-emergency-light text-[9px] font-bold px-1.5 py-0.5 rounded-full">{issues.filter(i => i.status === 'Open').length}</span>
          )}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'doctors' && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Physician Panel Status</p>
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0', docStatusBg[doc.status])}>
                  <UserCheck className={cn('w-6 h-6', docStatusColor[doc.status])} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-white">{doc.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{doc.specialty}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px]">
                    <span className={cn('font-bold uppercase tracking-wider flex items-center gap-1', docStatusColor[doc.status])}>
                      {doc.status === 'Available' ? <Wifi className="w-3 h-3" /> : doc.status === 'Offline' ? <WifiOff className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                      {doc.status}
                    </span>
                    <span className="text-gray-500">{doc.sessionsToday} sessions today</span>
                  </div>
                </div>
                <div className="text-right">
                  {doc.status !== 'Offline' && (
                    <>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest">Next Slot</p>
                      <p className="text-[12px] font-mono font-bold text-cyan-400">{new Date(doc.nextSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'issues' && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Session Issues</p>
            {issues.map(iss => (
              <div key={iss.id} className={cn('border rounded-xl p-4',
                iss.type === 'Connection' ? 'bg-emergency/10 border-emergency/30' :
                iss.type === 'No Show' ? 'bg-warning/10 border-warning/30' :
                iss.type === 'Technical' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/[0.03] border-white/10'
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                      iss.type === 'Connection' ? 'bg-emergency/20 text-emergency-light border-emergency/30' :
                      iss.type === 'No Show' ? 'bg-warning/20 text-warning-light border-warning/30' :
                      'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    )}>
                      <AlertTriangle className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />{iss.type}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{iss.sessionId}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(iss.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[13px] font-bold text-white mb-3">{iss.description}</p>
                {iss.status === 'Open' && (
                  <Button onClick={() => resolveIssue(iss.id)} size="sm" className="bg-white/5 border-white/10 text-[11px] hover:bg-white/10" leftIcon={<Wrench className="w-3 h-3" />}>Mark Resolved</Button>
                )}
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
