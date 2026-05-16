'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ShieldAlert, FileText, Crosshair, TerminalSquare, AlertTriangle, Workflow, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { SocData } from '../types/soc-analyst.types';

interface InvestigationWorkspaceProps {
  data: SocData;
  activeIncidentId?: string;
  onExecutePlaybook: (id: string) => void;
  onUpdateIncidentStatus: (id: string, status: string) => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({ data, activeIncidentId, onExecutePlaybook, onUpdateIncidentStatus }) => {
  const [activeTab, setActiveTab] = useState('logs');

  const incident = data.incidents.find(i => i.id === activeIncidentId);
  const incLogs = activeIncidentId ? data.logs.filter(l => l.incidentId === activeIncidentId) : [];
  const incPlaybooks = activeIncidentId ? data.playbooks.filter(p => p.incidentId === activeIncidentId) : [];
  // Threats aren't strongly mapped to incidentId in mock, showing top threats if no incident active
  const topThreats = data.threats.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  if (!activeIncidentId) {
    return (
      <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark items-center justify-center text-center p-8">
        <ShieldAlert className="w-12 h-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">SOC Investigation Center</h3>
        <p className="text-sm text-gray-400 max-w-md">
          Select an Active Incident from the left panel to begin log correlation, threat analysis, and playbook execution.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader 
        title="Investigation Workspace" 
        subtitle={`Analyzing: ${incident?.title || activeIncidentId}`} 
        action={
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] px-2 py-1 rounded border font-bold uppercase",
              incident?.status === 'Investigating' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
              incident?.status === 'Contained' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" :
              "bg-gray-500/10 text-gray-400 border-gray-500/30"
            )}>{incident?.status}</span>
            {incident?.status !== 'Contained' && (
              <Button size="sm" variant="outline" className="h-7 px-3 text-[10px] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10" onClick={() => onUpdateIncidentStatus(activeIncidentId, 'Contained')}>
                Mark Contained
              </Button>
            )}
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
            { id: 'logs', label: 'Correlated Logs', icon: <FileText className="w-4 h-4" /> },
            { id: 'threats', label: 'Threat Intel', icon: <Crosshair className="w-4 h-4" /> },
            { id: 'playbooks', label: 'Response Playbooks', icon: <Workflow className="w-4 h-4" /> },
          ]}
        />

        {/* LOG CORRELATION */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-emerald-400" /> Correlated Event Timeline
            </h3>
            {incLogs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No correlated logs found for this incident.</p>
            ) : (
              <div className="bg-[#0f111a] rounded-xl border border-white/10 overflow-hidden p-4 font-mono text-[11px] leading-relaxed relative">
                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-white/10 z-0"></div>
                <div className="space-y-6 relative z-10">
                  {incLogs.map(log => (
                    <div key={log.id} className="flex gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500 mt-1.5 shrink-0 relative z-10"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-3 mb-1 text-gray-500">
                          <span>{new Date(log.timestamp).toISOString()}</span>
                          <span className="text-indigo-400">[{log.logSource}]</span>
                          <span className="text-amber-400">{log.eventAction}</span>
                        </div>
                        <div className="text-green-400 bg-black/40 p-2 rounded border border-white/5 break-all">
                          {log.rawLog}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* THREAT INTEL */}
        {activeTab === 'threats' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Global Threat Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topThreats.map((threat, idx) => (
                <div key={idx} className="bg-surface rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{threat.type}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-red-500/10 text-red-400 border-red-500/30 flex items-center">
                      <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Risk Score: {threat.riskScore}
                    </span>
                  </div>
                  <h2 className="text-sm font-mono text-white mb-2 break-all">{threat.indicatorValue}</h2>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 mt-4 pt-3 border-t border-white/5">
                    <span>Source: <span className="text-indigo-300">{threat.threatIntelSource}</span></span>
                    <span>Last Seen: {new Date(threat.lastSeen).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYBOOKS */}
        {activeTab === 'playbooks' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Automated Response Playbooks</h3>
            {incPlaybooks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No playbooks associated with this incident type.</p>
            ) : (
              <div className="grid gap-3">
                {incPlaybooks.map((pb) => (
                  <div key={pb.id} className="bg-surface rounded-xl border border-white/10 p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Workflow className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-sm font-medium text-white">{pb.actionName}</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">PB-ID: {pb.id}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {pb.status === 'Executed' && (
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-400 flex items-center justify-end"><CheckCircle2 className="w-3 h-3 mr-1" /> Executed</p>
                          <p className="text-[9px] text-gray-500 mt-0.5">by {pb.executedBy}</p>
                        </div>
                      )}
                      
                      {pb.status === 'Available' && (
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px] h-7 px-3" onClick={() => onExecutePlaybook(pb.id)}>
                          <Play className="w-3 h-3 mr-1.5" /> Execute Playbook
                        </Button>
                      )}

                      {pb.status === 'Executing' && (
                        <span className="text-[10px] text-amber-400 animate-pulse">Running...</span>
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
};
