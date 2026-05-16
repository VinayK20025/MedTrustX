'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { OutbreakCluster, HygieneAudit, ComplianceProtocol } from '../types/infection-control.types';
import { useCompleteContainmentStep, useRaiseAuditAction, useFlagProtocol } from '../hooks/useInfectionControlAnalytics';
import { Biohazard, ClipboardCheck, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Wrench, Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { outbreaks: OutbreakCluster[]; audits: HygieneAudit[]; protocols: ComplianceProtocol[]; }

export function InfectionControlWorkspace({ outbreaks, audits, protocols }: Props) {
  const { mutate: completeStep } = useCompleteContainmentStep();
  const { mutate: raiseAction } = useRaiseAuditAction();
  const { mutate: flagProtocol } = useFlagProtocol();
  const [tab, setTab] = useState<'outbreaks' | 'audits' | 'compliance'>('outbreaks');

  const tabs = [
    { key: 'outbreaks' as const, label: 'Outbreak Control', icon: Biohazard },
    { key: 'audits' as const, label: 'Hygiene Audits', icon: ClipboardCheck },
    { key: 'compliance' as const, label: 'Compliance', icon: ShieldAlert },
  ];

  const compStatusColor: Record<string, string> = {
    Compliant: 'text-success-light bg-success/10',
    'Non-Compliant': 'text-emergency-light bg-emergency/15 border border-emergency/30',
    Pending: 'text-blue-300 bg-blue-500/10',
    Overdue: 'text-red-400 bg-red-900/20 border border-red-700/30 animate-pulse',
  };

  return (
    <Card className="border-teal-500/20 shadow-glass bg-[#020808] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-800 via-cyan-600 to-teal-700" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Biohazard className="w-5 h-5 text-teal-400" /> Infection Control Command
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Outbreak containment • Hygiene audits • Protocol compliance</p>
      </CardHeader>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-teal-400 border-teal-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* OUTBREAKS TAB */}
        {tab === 'outbreaks' && (
          <div className="p-5 space-y-5 animate-fade-in">
            {outbreaks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <CheckCircle2 className="w-12 h-12 text-success-light mb-3" />
                <p className="text-gray-400 font-bold">No active outbreaks</p>
              </div>
            ) : outbreaks.map(ob => (
              <div key={ob.id} className="bg-emergency/[0.06] border border-emergency/25 rounded-xl p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Biohazard className="w-4 h-4 text-emergency-light" />
                      <span className="text-[9px] font-mono text-gray-400">{ob.id} • Detected {new Date(ob.detectedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-[16px] font-black text-emergency-light">{ob.ward} — {ob.status} Outbreak</h4>
                    <p className="text-[13px] text-gray-300 mt-0.5 font-semibold">{ob.pathogen}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="text-[28px] font-black text-emergency-light">{ob.caseCount}</p>
                    <p className="text-[9px] text-gray-500 uppercase">Cases</p>
                  </div>
                </div>

                {/* Containment protocol steps */}
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Containment Protocol</p>
                  <div className="space-y-2">
                    {ob.containmentSteps.map(step => (
                      <div key={step.step} className={cn('flex items-center gap-3 p-2.5 rounded-lg border',
                        step.done ? 'bg-success/[0.04] border-success/15 opacity-70' : 'bg-white/[0.02] border-white/10'
                      )}>
                        <div className={cn('w-6 h-6 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-black',
                          step.done ? 'bg-success/20 border-success/50 text-success-light' : 'border-white/20 text-gray-400'
                        )}>
                          {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.step}
                        </div>
                        <span className={cn('text-[12px] flex-1', step.done ? 'line-through text-gray-500' : 'text-white font-bold')}>{step.label}</span>
                        {!step.done && (
                          <Button size="sm" onClick={() => completeStep({ id: ob.id, step: step.step })}
                            className="h-6 text-[9px] bg-success/10 hover:bg-success/20 text-success-light border border-success/30 shrink-0">Done</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AUDITS TAB */}
        {tab === 'audits' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {audits.map(audit => {
              const isPassing = audit.score >= 80;
              return (
                <div key={audit.id} className={cn('rounded-xl border p-4 space-y-3',
                  !isPassing ? 'bg-emergency/[0.05] border-emergency/20' : 'bg-white/[0.02] border-white/[0.06]'
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-bold text-white">{audit.area}</p>
                      <p className="text-[10px] text-gray-500">{audit.ward} • {new Date(audit.auditedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('text-[26px] font-black', audit.score >= 80 ? 'text-success-light' : 'text-emergency-light')}>{audit.score}<span className="text-[12px]">%</span></p>
                      <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded',
                        audit.status === 'Pass' ? 'bg-success/10 text-success-light' : 'bg-emergency/15 text-emergency-light'
                      )}>{audit.status}</span>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div className={cn('h-full transition-all', audit.score >= 80 ? 'bg-emerald-500' : 'bg-emergency-500')} style={{ width: `${audit.score}%` }} />
                  </div>
                  {audit.findings && <p className="text-[11px] text-gray-400 leading-relaxed italic">"{audit.findings}"</p>}
                  {!isPassing && (
                    <Button size="sm" onClick={() => raiseAction(audit.id)}
                      className="h-8 text-[11px] bg-warning/15 hover:bg-warning/25 text-warning-light border border-warning/30 w-full"
                      leftIcon={<Wrench className="w-3.5 h-3.5" />}>
                      Raise Corrective Action
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* COMPLIANCE TAB */}
        {tab === 'compliance' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {protocols.map(p => (
              <div key={p.id} className={cn('rounded-xl border p-4 flex items-center gap-4',
                p.status === 'Non-Compliant' || p.status === 'Overdue' ? 'bg-emergency/[0.04] border-emergency/20' : 'bg-white/[0.02] border-white/[0.06]'
              )}>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white">{p.protocol}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{p.department} • Last checked {new Date(p.lastCheckedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider', compStatusColor[p.status])}>{p.status}</span>
                  {(p.status === 'Non-Compliant' || p.status === 'Overdue') && (
                    <button onClick={() => flagProtocol(p.id)} className="p-1.5 bg-warning/10 hover:bg-warning/20 text-warning-light rounded border border-warning/25 transition-colors">
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
