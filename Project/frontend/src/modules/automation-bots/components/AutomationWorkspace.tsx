'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { PlayCircle, Activity, Workflow, AlertTriangle, ShieldAlert, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { AutomationData } from '../types/automation-bots.types';

interface AutomationWorkspaceProps {
  data: AutomationData;
  activeBotId?: string;
  onOverrideAction: (id: string) => void;
  onResolveIncident: (id: string) => void;
}

export const AutomationWorkspace: React.FC<AutomationWorkspaceProps> = ({ data, activeBotId, onOverrideAction, onResolveIncident }) => {
  const [activeTab, setActiveTab] = useState('jobs');

  const botJobs = activeBotId ? data.jobs.filter(j => j.botId === activeBotId) : data.jobs;
  const botMonitoring = activeBotId ? data.monitoring.filter(m => m.botId === activeBotId) : data.monitoring;
  const botActions = activeBotId ? data.actions.filter(a => a.botId === activeBotId) : data.actions;
  const botIncidents = activeBotId ? data.incidents.filter(i => !i.resolved && i.botId === activeBotId) : data.incidents.filter(i => !i.resolved);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="Execution & Monitoring Hub" subtitle={activeBotId ? `Bot Execution: ${activeBotId}` : "Global Automation Overview"} />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'jobs', label: 'Pipeline Jobs', icon: <PlayCircle className="w-4 h-4" /> },
            { id: 'monitoring', label: 'Monitoring Telemetry', icon: <Activity className="w-4 h-4" /> },
            { id: 'actions', label: 'Autonomous Actions', icon: <Workflow className="w-4 h-4" /> },
            { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, count: botIncidents.length },
          ]}
        />

        {/* PIPELINE JOBS */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-emerald-400" /> Recent Executions
            </h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/5">
                {botJobs.map(job => (
                  <div key={job.id} className="p-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                    {job.status === 'Success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" /> :
                     job.status === 'Running' ? <RotateCcw className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0 animate-spin-slow" /> :
                     <XCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-white font-medium truncate">{job.jobName}</span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider",
                            job.status === 'Success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            job.status === 'Running' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                            "bg-red-500/10 text-red-400 border-red-500/20"
                          )}>{job.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{new Date(job.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[10px]">
                        {!activeBotId && <span className="text-gray-400 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[9px]">{job.botId}</span>}
                        <span className="text-gray-500">Duration: <span className="text-gray-300">{(job.durationMs / 1000).toFixed(1)}s</span></span>
                        <span className="text-gray-500 border-l border-white/10 pl-3">Trigger: <span className="text-indigo-300">{job.triggeredBy}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MONITORING TELEMETRY */}
        {activeTab === 'monitoring' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Live Agent Telemetry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {botMonitoring.map((mon, idx) => (
                <div key={idx} className={cn("bg-surface rounded-xl border p-4",
                  mon.status === 'Anomaly Detected' ? "border-red-500/30 bg-red-500/5" :
                  mon.status === 'Warning' ? "border-amber-500/30 bg-amber-500/5" :
                  "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{mon.metricName}</p>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold",
                      mon.status === 'Normal' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      mon.status === 'Anomaly Detected' ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>{mon.status}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl font-bold text-white">{mon.currentValue}</h2>
                  </div>
                  {!activeBotId && (
                    <p className="text-[9px] text-indigo-300 font-mono mt-3 truncate">{mon.botId}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTONOMOUS ACTIONS */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Automated Remediation Logs</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Action</th>
                    {!activeBotId && <th className="p-3 font-medium">Bot</th>}
                    <th className="p-3 font-medium">Reason</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Human Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {botActions.map((act) => (
                    <tr key={act.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-xs text-white font-medium">{act.actionName}</td>
                      {!activeBotId && <td className="p-3 text-xs font-mono text-indigo-300">{act.botId}</td>}
                      <td className="p-3 text-[10px] text-gray-400">{act.reason}</td>
                      <td className="p-3">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                          act.status === 'Done' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          act.status === 'Overridden' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>{act.status}</span>
                      </td>
                      <td className="p-3">
                        {act.status !== 'Overridden' && act.status !== 'Done' && (
                          <Button size="sm" variant="outline" className="text-[9px] h-6 px-2 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => onOverrideAction(act.id)}>
                            Override
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INCIDENTS */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            {botIncidents.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No active incidents for this context.</p>
            ) : (
              botIncidents.map(inc => (
                <div key={inc.id} className={cn("bg-surface rounded-xl border p-4",
                  inc.severity === 'Critical' ? "border-red-500/30 bg-red-500/5" :
                  inc.severity === 'Warning' ? "border-amber-500/30 bg-amber-500/5" : "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className={cn("w-4 h-4 shrink-0 mt-0.5",
                        inc.severity === 'Critical' ? "text-red-400" : "text-amber-400"
                      )} />
                      <div>
                        <h4 className="text-sm font-medium text-white">{inc.issue}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-gray-400 font-mono">Agent: {inc.botId}</p>
                          {inc.automatedActionTaken && (
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-1.5 rounded border border-indigo-500/20 flex items-center">
                              <Workflow className="w-2.5 h-2.5 mr-1" /> {inc.automatedActionTaken}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                    <p className="text-[10px] text-gray-500">{new Date(inc.timestamp).toLocaleString()}</p>
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => onResolveIncident(inc.id)}>
                      Acknowledge & Resolve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
