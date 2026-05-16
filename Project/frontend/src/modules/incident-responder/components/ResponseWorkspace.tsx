'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Play, ShieldOff, RotateCcw, FileSearch, Workflow, AlertTriangle, CheckCircle2, XCircle, ShieldCheck, HardDrive, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { IncidentResponderData } from '../types/incident-responder.types';

interface ResponseWorkspaceProps {
  data: IncidentResponderData;
  activeIncidentId?: string;
  onExecuteAction: (id: string) => void;
  onUpdatePhase: (id: string, phase: string) => void;
}

export const ResponseWorkspace: React.FC<ResponseWorkspaceProps> = ({ data, activeIncidentId, onExecuteAction, onUpdatePhase }) => {
  const [activeTab, setActiveTab] = useState('response');

  const incident = data.incidents.find(i => i.id === activeIncidentId);
  const incActions = activeIncidentId ? data.actions.filter(a => a.incidentId === activeIncidentId) : [];
  const incContainment = activeIncidentId ? data.containment.filter(c => c.incidentId === activeIncidentId) : [];
  const incRecovery = activeIncidentId ? data.recovery.filter(r => r.incidentId === activeIncidentId) : [];
  const incForensics = activeIncidentId ? data.forensics.filter(f => f.incidentId === activeIncidentId) : [];
  const incPlaybook = activeIncidentId ? data.playbooks.filter(p => p.incidentId === activeIncidentId).sort((a, b) => a.order - b.order) : [];

  if (!activeIncidentId) {
    return (
      <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark items-center justify-center text-center p-8">
        <ShieldOff className="w-12 h-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Incident Response Center</h3>
        <p className="text-sm text-gray-400 max-w-md">
          Select an active breach from the left panel to begin containment, execute response playbooks, and manage recovery.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Response Workspace"
        subtitle={`Breach: ${incident?.title || activeIncidentId}`}
        action={
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] px-2 py-1 rounded border font-bold uppercase",
              incident?.phase === 'Containment' ? "bg-red-500/10 text-red-400 border-red-500/30" :
              incident?.phase === 'Eradication' ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
              incident?.phase === 'Recovery' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" :
              "bg-amber-500/10 text-amber-400 border-amber-500/30"
            )}>{incident?.phase}</span>
          </div>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'response', label: 'Response Actions', icon: <Play className="w-4 h-4" /> },
            { id: 'containment', label: 'Containment', icon: <ShieldOff className="w-4 h-4" /> },
            { id: 'recovery', label: 'Recovery', icon: <RotateCcw className="w-4 h-4" /> },
            { id: 'forensics', label: 'Forensics', icon: <FileSearch className="w-4 h-4" /> },
            { id: 'playbook', label: 'Playbook', icon: <Workflow className="w-4 h-4" /> },
          ]}
        />

        {/* RESPONSE ACTIONS */}
        {activeTab === 'response' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Breach Response Actions</h3>
            <div className="grid gap-3">
              {incActions.map(act => (
                <div key={act.id} className={cn("bg-surface rounded-xl border p-4 flex items-center justify-between",
                  act.status === 'Failed' ? "border-red-500/30 bg-red-500/5" :
                  act.status === 'Done' ? "border-emerald-500/20 bg-emerald-500/5" :
                  "border-white/10"
                )}>
                  <div className="flex items-start gap-3">
                    {act.status === 'Done' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> :
                     act.status === 'Executing' ? <RotateCcw className="w-4 h-4 text-indigo-400 animate-spin-slow mt-0.5 shrink-0" /> :
                     act.status === 'Failed' ? <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> :
                     <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                    <div>
                      <h4 className="text-sm font-medium text-white">{act.actionName}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10">{act.type}</span>
                        {act.executedBy && <span className="text-[10px] text-gray-500">by {act.executedBy}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-gray-500">{new Date(act.timestamp).toLocaleTimeString()}</p>
                    {act.status === 'Pending' && (
                      <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px] h-7 px-3" onClick={() => onExecuteAction(act.id)}>
                        <Play className="w-3 h-3 mr-1.5" /> Execute
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTAINMENT */}
        {activeTab === 'containment' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">System Containment Status</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">System</th>
                    <th className="p-3 font-medium">Action</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {incContainment.map(con => (
                    <tr key={con.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-xs text-white font-medium">{con.systemName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-300">{con.action}</td>
                      <td className="p-3">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold flex items-center w-fit",
                          con.status === 'Isolated' || con.status === 'Blocked' || con.status === 'Disabled'
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          {(con.status === 'Isolated' || con.status === 'Blocked') && <ShieldCheck className="w-3 h-3 mr-1" />}
                          {con.status}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-gray-500 font-mono">{new Date(con.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECOVERY */}
        {activeTab === 'recovery' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Service Recovery Tracker</h3>
            <div className="grid gap-3">
              {incRecovery.map(rec => (
                <div key={rec.id} className={cn("bg-surface rounded-xl border p-4",
                  rec.status === 'Failed' ? "border-red-500/30 bg-red-500/5" :
                  rec.status === 'Verified' ? "border-emerald-500/20" :
                  "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-indigo-400" /> {rec.serviceName}
                      </h4>
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                      rec.status === 'Restored' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      rec.status === 'Verified' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                      rec.status === 'In Progress' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      rec.status === 'Failed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    )}>{rec.status === 'Verified' ? '✔ Verified' : rec.status === 'Restored' ? '✔ Restored' : rec.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500">RTO Target:</span>
                      <span className="text-white font-mono">{rec.rtoMinutes}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500">Actual:</span>
                      <span className={cn("font-mono", 
                        rec.actualMinutes && rec.actualMinutes <= rec.rtoMinutes ? "text-emerald-400" : "text-red-400"
                      )}>{rec.actualMinutes ? `${rec.actualMinutes}m` : '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORENSICS */}
        {activeTab === 'forensics' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Digital Forensic Evidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incForensics.map(art => (
                <div key={art.id} className="bg-[#0f111a] rounded-xl border border-white/10 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FileSearch className="w-4 h-4 text-indigo-400" />
                      <p className="text-sm font-medium text-white">{art.artifactType}</p>
                    </div>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold",
                      art.status === 'Analyzed' || art.status === 'Preserved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      art.status === 'Analyzing' ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    )}>{art.status}</span>
                  </div>
                  <p className="text-[10px] text-green-400 font-mono bg-black/40 p-2 rounded border border-white/5 break-all">{art.hash}</p>
                  <p className="text-[10px] text-gray-500 mt-2">{new Date(art.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYBOOK */}
        {activeTab === 'playbook' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Response Playbook Execution</h3>
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10"></div>
              {incPlaybook.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-4 mb-6 relative">
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 z-10 bg-surface-dark",
                    step.status === 'Done' ? "border-emerald-500 text-emerald-400" :
                    step.status === 'In Progress' ? "border-indigo-500 text-indigo-400 animate-pulse" :
                    "border-white/20 text-gray-500"
                  )}>
                    {step.status === 'Done' ? '✓' : step.order}
                  </div>
                  <div className={cn("flex-1 p-3 rounded-xl border",
                    step.status === 'Done' ? "border-emerald-500/20 bg-emerald-500/5" :
                    step.status === 'In Progress' ? "border-indigo-500/20 bg-indigo-500/5" :
                    "border-white/10 bg-white/[0.02]"
                  )}>
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-white">{step.stepName}</h4>
                      <span className={cn("text-[9px] font-bold",
                        step.status === 'Done' ? "text-emerald-400" :
                        step.status === 'In Progress' ? "text-indigo-400" :
                        "text-gray-500"
                      )}>{step.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
