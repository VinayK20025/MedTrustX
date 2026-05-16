'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { QualityAudit, SafetyIncident, CAPA } from '../types/quality-manager.types';
import { useInitiateRca, useApproveCapa } from '../hooks/useQualityManagerAnalytics';
import { ClipboardCheck, ShieldAlert, GitMerge, FileCheck2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { audits: QualityAudit[]; incidents: SafetyIncident[]; capas: CAPA[]; }

export function QualityWorkspace({ audits, incidents, capas }: Props) {
  const { mutate: initiateRca } = useInitiateRca();
  const { mutate: approveCapa } = useApproveCapa();
  const [tab, setTab] = useState<'audits' | 'incidents' | 'capa'>('incidents');

  const tabs = [
    { key: 'incidents' as const, label: 'Patient Safety Incidents', icon: ShieldAlert },
    { key: 'capa' as const, label: 'CAPA Tracking', icon: GitMerge },
    { key: 'audits' as const, label: 'Audits & Compliance', icon: ClipboardCheck },
  ];

  return (
    <Card className="border-purple-500/20 shadow-glass bg-[#040306] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-800 via-indigo-600 to-purple-600" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-purple-400" /> Continuous Quality Improvement (CQI)
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Manage patient safety, RCAs, and drive hospital-wide corrective actions.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* INCIDENTS TAB */}
        {tab === 'incidents' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {incidents.map(inc => (
              <div key={inc.id} className={cn('rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all',
                inc.severity === 'Sentinel' || inc.status === 'RCA Required' ? 'bg-emergency/[0.06] border-emergency/30' : 'bg-white/[0.02] border-white/10'
              )}>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-gray-500">{inc.id}</span>
                    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded uppercase',
                      inc.severity === 'Sentinel' ? 'bg-emergency/20 text-emergency-light animate-pulse border border-emergency/30' :
                      inc.severity === 'Major' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-300'
                    )}>{inc.severity}</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-white">{inc.type}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">{inc.department} • Reported: {new Date(inc.reportedAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <span className={cn('text-[11px] font-bold',
                    inc.status === 'RCA Required' ? 'text-emergency-light' : 'text-warning-light'
                  )}>{inc.status}</span>
                  {inc.status === 'RCA Required' && (
                    <Button size="sm" onClick={() => initiateRca(inc.id)}
                      className="h-8 text-[11px] bg-emergency/15 hover:bg-emergency/25 text-emergency-light border border-emergency/30"
                      leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                      Initiate Root Cause Analysis
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CAPA TAB */}
        {tab === 'capa' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {capas.map(capa => (
              <div key={capa.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{capa.id} • {capa.department}</span>
                    <h4 className="text-[14px] font-bold text-white mt-1">Issue: {capa.issue}</h4>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0 ml-4',
                    capa.status === 'Implemented' ? 'bg-success/15 text-success-light border border-success/30' :
                    capa.status === 'Verifying' ? 'bg-blue-500/15 text-blue-300' : 'bg-white/10 text-gray-300'
                  )}>{capa.status}</span>
                </div>
                
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Corrective Action</p>
                  <p className="text-[12px] text-gray-300 leading-relaxed">{capa.action}</p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-[10px] text-gray-500">Target Date: {new Date(capa.dueDate).toLocaleDateString()}</p>
                  {capa.status === 'Verifying' && (
                    <Button size="sm" onClick={() => approveCapa(capa.id)}
                      className="h-8 text-[11px] bg-success/20 hover:bg-success/30 text-success-light border border-success/30"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                      Verify & Close
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AUDITS TAB */}
        {tab === 'audits' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {audits.map(audit => (
              <div key={audit.id} className="flex items-center gap-4 bg-white/[0.02] border border-white/10 rounded-xl p-4 transition-colors hover:bg-white/[0.04]">
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center border shrink-0',
                  audit.type === 'NABH' || audit.type === 'JCI' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'
                )}>
                  <ClipboardCheck className={cn('w-5 h-5', audit.type === 'NABH' || audit.type === 'JCI' ? 'text-purple-400' : 'text-gray-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-bold text-white truncate">{audit.title}</h4>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase',
                      audit.type === 'NABH' || audit.type === 'JCI' ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' : 'bg-white/10 text-gray-300 border-white/10'
                    )}>{audit.type}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{audit.area} • Auditor: {audit.auditor}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn('text-[11px] font-bold uppercase mb-1',
                    audit.status === 'In Progress' ? 'text-success-light' : 'text-gray-400'
                  )}>{audit.status}</p>
                  <p className="text-[10px] text-gray-500">{new Date(audit.scheduledDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
