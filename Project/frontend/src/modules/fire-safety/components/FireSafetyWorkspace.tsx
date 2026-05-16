'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { FireIncident, SafetyEquipment, ComplianceRecord } from '../types/fire-safety.types';
import { useCompleteResponseStep, useNotifyFireDept, useRaiseEquipmentFault } from '../hooks/useFireSafetyAnalytics';
import { Flame, Wrench, ShieldCheck, CheckCircle2, Phone, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { incidents: FireIncident[]; equipment: SafetyEquipment[]; compliance: ComplianceRecord[]; }

export function FireSafetyWorkspace({ incidents, equipment, compliance }: Props) {
  const { mutate: completeStep } = useCompleteResponseStep();
  const { mutate: notifyFireDept } = useNotifyFireDept();
  const { mutate: raiseFault } = useRaiseEquipmentFault();
  const [tab, setTab] = useState<'incidents' | 'equipment' | 'compliance'>('incidents');

  const tabs = [
    { key: 'incidents' as const, label: 'Incidents & Response', icon: Flame },
    { key: 'equipment' as const, label: 'Equipment', icon: Wrench },
    { key: 'compliance' as const, label: 'Compliance', icon: ShieldCheck },
  ];

  const eqStatusColor: Record<string, string> = {
    OK: 'text-emerald-400 bg-emerald-500/10', Fault: 'text-emergency-light bg-emergency/15 border border-emergency/30', Expired: 'text-red-400 bg-red-900/20 border border-red-700/30', 'Due Inspection': 'text-warning-light bg-warning/15'
  };

  const compStatusColor: Record<string, string> = {
    Passed: 'text-success-light bg-success/10', Failed: 'text-emergency-light bg-emergency/15 border border-emergency/30', Pending: 'text-blue-300 bg-blue-500/10', Overdue: 'text-red-400 bg-red-900/20 border border-red-700/30 animate-pulse'
  };

  return (
    <Card className="border-orange-500/20 shadow-glass bg-[#080402] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-800 via-orange-600 to-yellow-600" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" /> Fire Safety Command Workspace
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Incident response • Equipment status • Compliance tracking</p>
      </CardHeader>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-orange-400 border-orange-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* INCIDENTS TAB */}
        {tab === 'incidents' && (
          <div className="p-5 space-y-5 animate-fade-in">
            {incidents.map(inc => (
              <div key={inc.id} className={cn('rounded-xl border p-4 space-y-4',
                inc.severity === 'Critical' ? 'bg-emergency/[0.07] border-emergency/30' : 'bg-warning/[0.04] border-warning/20'
              )}>
                {/* Incident header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500">{inc.id} • {inc.zone}</span>
                    <h4 className={cn('text-[16px] font-black mt-0.5', inc.severity === 'Critical' ? 'text-emergency-light' : 'text-warning-light')}>
                      {inc.type} — {inc.severity}
                    </h4>
                    <p className="text-[12px] text-gray-300 mt-1">{inc.description}</p>
                  </div>
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-2 shrink-0',
                    inc.status === 'Responding' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse' : 'bg-white/10 text-gray-300'
                  )}>{inc.status}</span>
                </div>

                {/* Guided response steps */}
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Guided Response Protocol</p>
                  <div className="space-y-2">
                    {inc.responseSteps.map(step => (
                      <div key={step.step} className={cn('flex items-center gap-3 p-2.5 rounded-lg border transition-all',
                        step.done ? 'bg-success/[0.05] border-success/15 opacity-70' : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      )}>
                        <div className={cn('w-6 h-6 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-black',
                          step.done ? 'bg-success/20 border-success/50 text-success-light' : 'border-white/20 text-gray-400'
                        )}>
                          {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.step}
                        </div>
                        <span className={cn('text-[12px] flex-1', step.done ? 'line-through text-gray-500' : 'text-white font-bold')}>{step.label}</span>
                        {!step.done && (
                          <Button size="sm" onClick={() => completeStep({ id: inc.id, step: step.step })}
                            className="h-6 text-[9px] bg-success/10 hover:bg-success/20 text-success-light border border-success/30 shrink-0">
                            Done
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button onClick={() => notifyFireDept(inc.id)}
                    className="flex-1 h-11 bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-700/40 font-black text-[12px]"
                    leftIcon={<Phone className="w-4 h-4" />}>
                    Notify Fire Department (101)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EQUIPMENT TAB */}
        {tab === 'equipment' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {equipment.map(eq => (
              <div key={eq.id} className={cn('rounded-xl border p-4 flex items-center gap-4',
                eq.status === 'Fault' || eq.status === 'Expired' ? 'bg-emergency/[0.04] border-emergency/20' : 'bg-white/[0.02] border-white/[0.06]'
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-bold text-white">{eq.type}</span>
                    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider', eqStatusColor[eq.status])}>{eq.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{eq.location} • {eq.zone}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">Next due: {new Date(eq.nextDueAt).toLocaleDateString()}</p>
                </div>
                {(eq.status === 'Fault' || eq.status === 'Expired') && (
                  <Button size="sm" onClick={() => raiseFault(eq.id)}
                    className="h-8 text-[10px] bg-warning/15 hover:bg-warning/25 text-warning-light border border-warning/30 shrink-0"
                    leftIcon={<Wrench className="w-3 h-3" />}>
                    Raise Work Order
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* COMPLIANCE TAB */}
        {tab === 'compliance' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {compliance.map(rec => (
              <div key={rec.id} className={cn('rounded-xl border p-4 flex items-center gap-4',
                rec.status === 'Overdue' || rec.status === 'Failed' ? 'bg-emergency/[0.04] border-emergency/20' : 'bg-white/[0.02] border-white/[0.06]'
              )}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-bold text-white">{rec.area}</span>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">{rec.type}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Due: {new Date(rec.dueDate).toLocaleDateString()}</p>
                </div>
                <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shrink-0', compStatusColor[rec.status])}>{rec.status}</span>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
