'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ShieldCheck, Scale, AlertTriangle, FileSearch, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { AiGovernanceData } from '../types/ai-governance.types';

interface GovernanceWorkspaceProps {
  data: AiGovernanceData;
  activeModelId?: string;
  onInitiateAudit: (id: string) => void;
}

export const GovernanceWorkspace: React.FC<GovernanceWorkspaceProps> = ({ data, activeModelId, onInitiateAudit }) => {
  const [activeTab, setActiveTab] = useState('bias');

  const modelBias = activeModelId ? data.biasMetrics[activeModelId] || [] : [];
  const modelRisks = activeModelId ? data.risks.filter(r => r.affectedModelId === activeModelId) : data.risks;
  const modelAudits = activeModelId ? data.auditLogs.filter(l => l.modelId === activeModelId) : data.auditLogs;

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="AI Compliance & Ethics Hub" subtitle={activeModelId ? `Governance Details: ${activeModelId}` : "Global Governance View"} />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'bias', label: 'Bias & Fairness', icon: <Scale className="w-4 h-4" /> },
            { id: 'compliance', label: 'Regulatory Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'risk', label: 'AI Risk Registry', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'audit', label: 'Audit Logs', icon: <FileSearch className="w-4 h-4" /> },
          ]}
        />

        {/* BIAS & FAIRNESS */}
        {activeTab === 'bias' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Fairness Validation</h3>
            {activeModelId ? (
              modelBias.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No bias issues recorded for this model.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modelBias.map((metric, idx) => (
                    <div key={idx} className={cn("bg-surface rounded-xl border p-4",
                      metric.status === 'Detected' ? "border-red-500/30 bg-red-500/5" :
                      metric.status === 'Warning' ? "border-amber-500/30" : "border-emerald-500/30"
                    )}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{metric.demographic}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                          metric.status === 'Detected' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          metric.status === 'Warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}>{metric.status}</span>
                      </div>
                      <h4 className="text-sm font-medium text-white mb-3">{metric.metric}</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                          <div className={cn("h-full", metric.status === 'Detected' ? "bg-red-500" : metric.status === 'Warning' ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(metric.disparity * 100 * 5, 100)}%` }} />
                          <div className="absolute top-0 bottom-0 w-px bg-white/50 z-10" style={{ left: '20%' }} title="Acceptable Threshold (0.04)" />
                        </div>
                        <span className="text-xs font-mono text-gray-400">{metric.disparity.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-400 italic">Select a model from the registry to view its fairness metrics.</p>
            )}
          </div>
        )}

        {/* REGULATORY COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Global Framework Alignment</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Regulation</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Active Issues</th>
                    <th className="p-3 font-medium">Last Audit</th>
                    <th className="p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.regulations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <p className="text-xs font-medium text-white">{reg.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{reg.id}</p>
                      </td>
                      <td className="p-3">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold flex items-center w-fit",
                          reg.status === 'Compliant' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          reg.status === 'Non-Compliant' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          {reg.status === 'Compliant' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={cn("text-xs font-bold", reg.issuesCount > 0 ? "text-amber-400" : "text-gray-500")}>
                          {reg.issuesCount}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-gray-400">
                        {new Date(reg.lastAuditDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => onInitiateAudit(reg.id)}>
                          Run Audit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI RISK REGISTRY */}
        {activeTab === 'risk' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Identified AI Risks</h3>
            {modelRisks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No risks logged.</p>
            ) : (
              <div className="space-y-3">
                {modelRisks.map(risk => (
                  <div key={risk.id} className={cn("bg-surface rounded-xl border p-4",
                    risk.severity === 'High' && risk.status !== 'Resolved' ? "border-red-500/30" :
                    risk.severity === 'Medium' && risk.status !== 'Resolved' ? "border-amber-500/30" : "border-white/10"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className={cn("w-4 h-4",
                          risk.severity === 'High' ? "text-red-400" : risk.severity === 'Medium' ? "text-amber-400" : "text-emerald-400"
                        )} />
                        <h4 className="text-sm font-medium text-white">{risk.riskName}</h4>
                        {!activeModelId && <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-mono ml-2">{risk.affectedModelId}</span>}
                      </div>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                        risk.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        risk.status === 'Open' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>{risk.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 pl-6">{risk.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Governance Audit Trail</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/5">
                {modelAudits.map(log => (
                  <div key={log.id} className="p-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                    <FileText className={cn("w-4 h-4 mt-0.5",
                      log.status === 'Success' ? "text-emerald-400" :
                      log.status === 'Failed' ? "text-red-400" : "text-amber-400"
                    )} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-xs text-white font-medium">{log.action}</p>
                        <p className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">By: {log.user}</span>
                        <span className="text-[10px] text-gray-500">•</span>
                        <span className="text-[10px] text-gray-400 font-mono">Model: {log.modelId}</span>
                        <span className="text-[10px] text-gray-500">•</span>
                        <span className="text-[10px] text-gray-400 font-mono">Ref: {log.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
