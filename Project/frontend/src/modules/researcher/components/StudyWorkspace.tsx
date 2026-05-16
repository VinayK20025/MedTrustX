'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ClinicalStudy, ComplianceApproval } from '../types/researcher.types';
import { useLogAdverseEvent, useGenerateStudyReport } from '../hooks/useResearcherAnalytics';
import { Microscope, Users, ClipboardCheck, FileDown, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { study?: ClinicalStudy; approvals: ComplianceApproval[]; }

export function StudyWorkspace({ study, approvals }: Props) {
  const { mutate: logAE } = useLogAdverseEvent();
  const { mutate: generateReport } = useGenerateStudyReport();
  const [tab, setTab] = useState<'overview' | 'compliance'>('overview');

  return (
    <Card className="border-purple-500/20 shadow-glass bg-[#030205] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-800 via-fuchsia-500 to-blue-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Microscope className="w-5 h-5 text-purple-400" /> Research Command Center
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Manage study protocols, monitor enrollment, and ensure regulatory compliance.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('overview')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'overview' ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Study Overview</button>
        <button onClick={() => setTab('compliance')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'compliance' ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Ethics & Compliance</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'overview' && (
          <div className="p-5 flex flex-col gap-5">
            {!study ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-20">
                <Microscope className="w-12 h-12 text-purple-500 mb-3" />
                <p className="text-gray-400 font-bold">Select a clinical trial to view details.</p>
              </div>
            ) : (
              <>
                {/* Study Header */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{study.id} • {study.phase}</span>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border',
                      study.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      study.status === 'Paused' ? 'bg-warning/20 text-warning-light border-warning/30' : 'bg-white/5 text-gray-400 border-white/10'
                    )}>{study.status}</span>
                  </div>
                  <h3 className="text-[20px] font-black text-white mb-4 leading-tight">{study.title}</h3>
                  
                  {/* Enrollment Gauge */}
                  <div className="grid grid-cols-3 gap-4 bg-black/40 border border-white/5 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Enrolled</p>
                      <p className="text-3xl font-black font-mono text-purple-400">{study.currentEnrollment}</p>
                    </div>
                    <div className="text-center border-x border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Target</p>
                      <p className="text-3xl font-black font-mono text-white">{study.targetEnrollment}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Progress</p>
                      <p className="text-3xl font-black font-mono text-emerald-400">{study.progress}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2.5 bg-black/60 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 transition-all" style={{ width: `${study.progress}%` }} />
                  </div>

                  {study.adverseEvents > 0 && (
                    <div className="bg-emergency/10 border border-emergency/30 rounded-lg p-3 flex items-start gap-2 mb-4">
                      <AlertTriangle className="w-4 h-4 text-emergency-light mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-emergency-light uppercase tracking-widest mb-0.5">Adverse Event(s) Reported</p>
                        <p className="text-[11px] text-red-200">{study.adverseEvents} event(s) flagged. Review is required per protocol SOP before continuing enrollment.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button onClick={() => logAE(study.id)} className="h-10 bg-emergency/10 text-emergency-light border border-emergency/30 hover:bg-emergency/20 text-[12px]" leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}>Log Adverse Event</Button>
                    <Button onClick={() => generateReport(study.id)} className="h-10 bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 text-[12px]" leftIcon={<FileDown className="w-3.5 h-3.5" />}>Generate Report</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'compliance' && (
          <div className="p-5 space-y-4">
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Regulatory & Ethics Board Approvals</h4>
            {approvals.map(a => (
              <div key={a.id} className={cn('border rounded-xl p-4',
                a.status === 'Approved' ? 'bg-success/10 border-success/30' :
                a.status === 'Pending Review' ? 'bg-warning/10 border-warning/30' : 'bg-emergency/10 border-emergency/30'
              )}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {a.status === 'Approved' ? <ShieldCheck className="w-4 h-4 text-success-light" /> : <ClipboardCheck className="w-4 h-4 text-warning-light" />}
                    {a.board}
                  </h4>
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                    a.status === 'Approved' ? 'bg-success/20 text-success-light' : 'bg-warning/20 text-warning-light'
                  )}>{a.status}</span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Valid Until: <span className="font-bold text-white">{a.validUntil}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
