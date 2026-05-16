'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { FileSearch, Map, AlertTriangle, Wrench, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { AuditData, AuditControl } from '../types/audit.types';

interface AuditWorkspaceProps {
  data: AuditData;
  activeControlId?: string;
  onUpdateFinding: (id: string, status: string) => void;
  onCloseCapa: (id: string) => void;
}

const severityConfig: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const capaStages = ['Open', 'In Progress', 'Validation Pending', 'Closed'];

export const AuditWorkspace: React.FC<AuditWorkspaceProps> = ({ data, activeControlId, onUpdateFinding, onCloseCapa }) => {
  const [activeTab, setActiveTab] = useState('audits');
  const selectedControl = data.controls.find(c => c.id === activeControlId) || data.controls[0];
  const relatedFindings = data.findings.filter(f => f.controlRef === selectedControl?.id);
  const allCapas = Object.values(data.capas).flat();

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={selectedControl ? `${selectedControl.title}` : 'Audit Workspace'}
        subtitle={selectedControl ? `${selectedControl.id} — ${selectedControl.domain} Domain` : 'Select a control'}
        action={
          selectedControl && (
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded border uppercase",
              selectedControl.effectiveness === 'Effective' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              selectedControl.effectiveness === 'Partially Effective' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
              "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}>
              {selectedControl.effectiveness}
            </span>
          )
        }
      />

      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'audits', label: 'Audit Cycles', icon: <FileSearch className="w-4 h-4" />, count: data.audits.length },
            { id: 'mapping', label: 'Compliance Mapping', icon: <Map className="w-4 h-4" />, count: data.mappings.length },
            { id: 'findings', label: 'Findings', icon: <AlertTriangle className="w-4 h-4" />, count: data.findings.filter(f => f.status !== 'Closed').length },
            { id: 'capa', label: 'CAPA', icon: <Wrench className="w-4 h-4" />, count: allCapas.filter(c => c.status !== 'Closed').length },
          ]}
        />

        {/* AUDIT CYCLES */}
        {activeTab === 'audits' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Active & Recent Audit Cycles</h3>
            {data.audits.map(audit => (
              <div key={audit.id} className="bg-surface rounded-xl border border-white/10 p-4 relative overflow-hidden">
                <div className={cn("absolute left-0 top-0 w-1 h-full",
                  audit.status === 'Completed' ? "bg-emerald-500" :
                  audit.status === 'In Progress' ? "bg-indigo-500" :
                  audit.status === 'Overdue' ? "bg-rose-500" : "bg-gray-500"
                )} />
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-mono text-gray-500 mb-0.5">{audit.id}</p>
                      <h4 className="text-sm font-medium text-white">{audit.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{audit.scope}</p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase ml-3 shrink-0",
                      audit.status === 'Completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      audit.status === 'In Progress' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      audit.status === 'Overdue' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      "bg-white/5 text-gray-400 border-white/10"
                    )}>{audit.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-3">
                    <span>Auditor: {audit.auditor}</span>
                    <span>Started: {new Date(audit.startDate).toLocaleDateString()}</span>
                    {audit.endDate && <span>Ended: {new Date(audit.endDate).toLocaleDateString()}</span>}
                    {audit.findingsCount > 0 && (
                      <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        {audit.findingsCount} findings
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMPLIANCE MAPPING */}
        {activeTab === 'mapping' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Control-to-Standard Compliance Mapping</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Control</th>
                    <th className="pb-3 px-4">Standard</th>
                    <th className="pb-3 px-4">Clause</th>
                    <th className="pb-3 px-4">Last Verified</th>
                    <th className="pb-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {data.mappings.map((m, i) => (
                    <tr key={i} className="text-sm text-gray-300 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-white font-medium">{m.controlTitle}</td>
                      <td className="py-3 px-4 text-xs">{m.standard}</td>
                      <td className="py-3 px-4 font-mono text-xs text-indigo-300">{m.clause}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">{new Date(m.lastVerified).toLocaleDateString()}</td>
                      <td className="py-3 pl-4 text-right">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded border uppercase font-bold",
                          m.status === 'Compliant' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          m.status === 'Non-Compliant' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          m.status === 'Partial' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-white/5 text-gray-400 border-white/10"
                        )}>{m.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FINDINGS */}
        {activeTab === 'findings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">Audit Findings</h3>
              <span className="text-xs text-gray-400">
                {data.findings.filter(f => f.status === 'Open' || f.status === 'In Remediation').length} open
              </span>
            </div>
            {data.findings.map(finding => (
              <div key={finding.id} className={cn(
                "bg-surface rounded-xl border p-4",
                finding.severity === 'Critical' ? "border-red-500/20 bg-red-500/5" :
                finding.severity === 'High' ? "border-rose-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 mb-0.5">{finding.id} → {finding.controlRef}</p>
                    <h4 className="text-sm font-medium text-white">{finding.title}</h4>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", severityConfig[finding.severity])}>
                      {finding.severity}
                    </span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10",
                      finding.status === 'Closed' ? "text-emerald-400" :
                      finding.status === 'In Remediation' ? "text-amber-400" : "text-gray-400"
                    )}>{finding.status}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mb-3 leading-relaxed">{finding.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>{finding.domain}</span>
                    <span>Owner: {finding.owner}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(finding.dateRaised).toLocaleDateString()}</span>
                  </div>
                  {finding.status !== 'Closed' && (
                    <Button size="sm" variant="outline" className="text-xs border-white/10 text-white h-7 px-3"
                      onClick={() => onUpdateFinding(finding.id, 'In Remediation')}>
                      Assign CAPA
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CAPA */}
        {activeTab === 'capa' && (
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-white mb-4">CAPA — Corrective & Preventive Actions</h3>
            {Object.entries(data.capas).map(([findingId, capas]) => {
              const finding = data.findings.find(f => f.id === findingId);
              return (
                <div key={findingId} className="bg-surface rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <p className="text-sm font-medium text-white">{finding?.title || findingId}</p>
                  </div>

                  <div className="space-y-4">
                    {capas.map(capa => {
                      const stageIdx = capaStages.indexOf(capa.status);
                      return (
                        <div key={capa.id} className="bg-black/20 rounded-lg p-3 border border-white/5">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-sm text-white font-medium">{capa.action}</p>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ml-3 shrink-0",
                              capa.status === 'Closed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              capa.status === 'In Progress' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                              "bg-white/5 text-gray-400 border-white/10"
                            )}>{capa.status}</span>
                          </div>

                          {/* Mini workflow */}
                          <div className="flex items-center gap-1 mb-3">
                            {capaStages.map((stage, i) => (
                              <React.Fragment key={stage}>
                                <div className={cn("text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap",
                                  i < stageIdx ? "bg-emerald-500/20 text-emerald-400" :
                                  i === stageIdx ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-600"
                                )}>{stage}</div>
                                {i < capaStages.length - 1 && (
                                  <ArrowRight className="w-2.5 h-2.5 text-gray-600 shrink-0" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex gap-3 text-gray-500">
                              <span>Root Cause: {capa.rootCause}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3 h-3" /> Due: {new Date(capa.dueDate).toLocaleDateString()}
                              </span>
                              {capa.status !== 'Closed' && (
                                <Button size="sm" variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 h-6 px-2"
                                  onClick={() => onCloseCapa(capa.id)}>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Close
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
