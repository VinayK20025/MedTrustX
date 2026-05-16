'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RiskItem, RiskMitigationAction, LinkedIncident } from '../types/legal-risk.types';
import { useUpdateRiskStatus, useUpdateMitigationStatus } from '../hooks/useLegalRiskAnalytics';
import { ShieldAlert, AlertTriangle, GitMerge, FileCheck2, CheckCircle2, ChevronRight, ListChecks } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { risk?: RiskItem; mitigations: RiskMitigationAction[]; incidents: LinkedIncident[]; }

export function RiskWorkspace({ risk, mitigations, incidents }: Props) {
  const { mutate: updateStatus } = useUpdateRiskStatus();
  const { mutate: updateMitigation } = useUpdateMitigationStatus();
  const [tab, setTab] = useState<'assessment' | 'mitigation'>('assessment');

  if (!risk) {
    return (
      <Card className="border-orange-500/20 shadow-glass bg-[#060302] h-full flex items-center justify-center">
        <div className="text-center opacity-40">
          <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Select a risk from the registry to view intelligence.</p>
        </div>
      </Card>
    );
  }

  const linkedMuts = mitigations.filter(m => m.riskId === risk.id);
  const linkedIncs = incidents.filter(i => i.riskId === risk.id);

  return (
    <Card className="border-orange-500/20 shadow-glass bg-[#050302] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-800 via-red-600 to-orange-500" />

      <CardHeader className="border-b border-white/[0.04] p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{risk.id} • {risk.category} Risk</span>
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded border uppercase',
            risk.status === 'Identified' ? 'bg-emergency/15 text-emergency-light border-emergency/30' :
            risk.status === 'Assessing' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
          )}>{risk.status}</span>
        </div>
        <h3 className="text-[20px] font-black text-white leading-tight">{risk.title}</h3>
        <p className="text-[12px] text-gray-400 mt-2">Department: <span className="text-gray-300 font-semibold">{risk.department}</span> • Source: {risk.source}</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('assessment')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'assessment' ? 'text-orange-400 border-orange-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><AlertTriangle className="w-3.5 h-3.5" /> Assessment & Exposure</button>
        <button onClick={() => setTab('mitigation')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'mitigation' ? 'text-orange-400 border-orange-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><GitMerge className="w-3.5 h-3.5" /> Mitigation Plan</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* ASSESSMENT TAB */}
        {tab === 'assessment' && (
          <div className="p-6 space-y-6 animate-fade-in">
            {/* Risk Matrix Score */}
            <div>
              <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ListChecks className="w-4 h-4" /> Exposure Quantification</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Probability</p>
                  <p className={cn('text-[18px] font-black', risk.probability === 'High' ? 'text-emergency-light' : risk.probability === 'Medium' ? 'text-orange-400' : 'text-success-light')}>{risk.probability}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Impact</p>
                  <p className={cn('text-[18px] font-black', risk.impact === 'High' ? 'text-emergency-light' : risk.impact === 'Medium' ? 'text-orange-400' : 'text-success-light')}>{risk.impact}</p>
                </div>
                <div className={cn('border rounded-lg p-4', risk.severity === 'Critical' ? 'bg-emergency/10 border-emergency/30' : 'bg-white/[0.02] border-white/10')}>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Final Severity</p>
                  <p className={cn('text-[18px] font-black', risk.severity === 'Critical' ? 'text-emergency-light' : 'text-white')}>{risk.severity}</p>
                </div>
              </div>
            </div>

            {/* Linked Incidents (Proof of Exposure) */}
            <div>
              <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Linked Medico-Legal Incidents</h4>
              {linkedIncs.length === 0 ? (
                <p className="text-[12px] text-gray-500 italic">No incidents directly linked to this risk yet.</p>
              ) : (
                <div className="space-y-2">
                  {linkedIncs.map(inc => (
                    <div key={inc.id} className="flex items-center justify-between bg-black/30 border border-white/10 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{inc.id}</span>
                        <span className="text-[12px] text-gray-300 font-bold">{inc.type}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">{new Date(inc.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-white/[0.04]">
               {risk.status === 'Identified' && (
                 <Button onClick={() => updateStatus({ id: risk.id, status: 'Assessing' })} className="w-full h-10 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40">Move to Assessment Phase</Button>
               )}
            </div>
          </div>
        )}

        {/* MITIGATION TAB */}
        {tab === 'mitigation' && (
          <div className="p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FileCheck2 className="w-4 h-4" /> Preventative Controls</h4>
              <Button size="sm" className="h-7 text-[10px] bg-white/10 hover:bg-white/20 border-transparent text-white">+ Add Control Action</Button>
            </div>
            
            {linkedMuts.length === 0 ? (
              <p className="text-[12px] text-gray-500 italic">No mitigation plan defined.</p>
            ) : (
              <div className="space-y-3">
                {linkedMuts.map(mut => (
                  <div key={mut.id} className={cn('bg-white/[0.02] border rounded-xl p-4',
                    mut.status === 'Completed' ? 'border-success/20 bg-success/[0.02]' : 'border-white/10'
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded uppercase',
                        mut.status === 'Completed' ? 'bg-success/15 text-success-light' : 'bg-blue-500/15 text-blue-300'
                      )}>{mut.status}</span>
                      <span className="text-[10px] text-gray-500">Target: {new Date(mut.dueDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[13px] font-medium text-white mb-3">{mut.action}</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="text-[10px] text-gray-400">Owner: {mut.owner}</span>
                      {mut.status !== 'Completed' && (
                        <Button size="sm" onClick={() => updateMitigation({ id: mut.id, status: 'Completed' })} className="h-7 text-[10px] bg-success/15 hover:bg-success/25 text-success-light border border-success/30" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>Mark Completed</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
