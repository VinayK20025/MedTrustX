'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RegulatoryLaw, ComplianceAuditChecklist, HospitalLicense } from '../types/legal-compliance.types';
import { useExportStatutoryReport } from '../hooks/useLegalComplianceAnalytics';
import { Scale, BookOpenCheck, ClipboardCheck, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { regulations: RegulatoryLaw[]; checklists: ComplianceAuditChecklist[]; licenses: HospitalLicense[]; }

export function ComplianceWorkspace({ regulations, checklists, licenses }: Props) {
  const { mutate: exportRep } = useExportStatutoryReport();
  const [tab, setTab] = useState<'regulations' | 'checklists' | 'licenses'>('regulations');

  const tabs = [
    { key: 'regulations' as const, label: 'Statutory Laws', icon: Scale },
    { key: 'checklists' as const, label: 'Audit Readiness', icon: ClipboardCheck },
    { key: 'licenses' as const, label: 'Hospital Certifications', icon: BookOpenCheck },
  ];

  return (
    <Card className="border-purple-500/20 shadow-glass bg-[#040206] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-800 via-pink-600 to-orange-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[16px] font-black text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" /> Regulatory Command Center
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Track laws, licenses, and maintain continuous hospital audit readiness.</p>
          </div>
          <Button size="sm" onClick={() => exportRep()} className="h-8 text-[11px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30" leftIcon={<Download className="w-3.5 h-3.5" />}>Statutory Export</Button>
        </div>
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

        {/* REGULATIONS TAB */}
        {tab === 'regulations' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {regulations.map(reg => (
              <div key={reg.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-colors hover:bg-white/[0.04]">
                <div className={cn('w-1.5 h-12 rounded-full shrink-0',
                  reg.complianceStatus === 'Compliant' ? 'bg-success-light' : reg.complianceStatus === 'At Risk' ? 'bg-warning-light' : 'bg-emergency-light'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[14px] font-bold text-white truncate">{reg.law}</h4>
                    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded border uppercase',
                      reg.complianceStatus === 'Compliant' ? 'bg-success/10 text-success-light border-success/30' :
                      reg.complianceStatus === 'At Risk' ? 'bg-warning/10 text-warning-light border-warning/30' :
                      'bg-emergency/10 text-emergency-light border-emergency/30 animate-pulse'
                    )}>{reg.complianceStatus}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Scope: {reg.departmentScope}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Last Audit</p>
                  <p className="text-[12px] font-bold text-gray-300">{new Date(reg.lastAuditDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHECKLISTS TAB */}
        {tab === 'checklists' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {checklists.map(chk => (
              <div key={chk.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[14px] font-bold text-white">{chk.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-1">Responsible: {chk.department}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase',
                    chk.status === 'Completed' ? 'bg-success/15 text-success-light' : chk.status === 'In Progress' ? 'bg-blue-500/15 text-blue-300' : 'bg-white/10 text-gray-300'
                  )}>{chk.status}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-purple-500" style={{ width: `${(chk.completedChecks / chk.totalChecks) * 100}%` }} />
                  </div>
                  <span className="text-[12px] font-mono font-bold text-purple-300 shrink-0">{chk.completedChecks} / {chk.totalChecks}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                    <AlertTriangle className={cn('w-3.5 h-3.5', chk.status !== 'Completed' ? 'text-warning-light' : 'text-gray-600')} /> 
                    Due: {new Date(chk.dueDate).toLocaleDateString()}
                  </p>
                  <Button size="sm" className="h-8 text-[11px] bg-white/10 hover:bg-white/20 text-white border-transparent">Open Audit Form</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LICENSES TAB */}
        {tab === 'licenses' && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {licenses.map(lic => (
              <div key={lic.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col justify-between h-32">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-black/30 px-1.5 py-0.5 rounded">{lic.type}</span>
                    {lic.status === 'Active' ? <CheckCircle2 className="w-4 h-4 text-success-light" /> : <AlertTriangle className="w-4 h-4 text-emergency-light" />}
                  </div>
                  <h4 className="text-[14px] font-bold text-white leading-tight">{lic.name}</h4>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] text-gray-500">Exp: <span className={cn('font-bold', lic.status === 'Active' ? 'text-gray-300' : 'text-emergency-light')}>{new Date(lic.expiryDate).toLocaleDateString()}</span></p>
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded border uppercase',
                    lic.status === 'Active' ? 'bg-success/10 text-success-light border-success/30' : 'bg-emergency/10 text-emergency-light border-emergency/30'
                  )}>{lic.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
