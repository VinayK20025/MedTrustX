'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Database, Shield, CheckSquare, ScrollText, Siren, CheckCircle, XCircle, AlertTriangle, RefreshCw, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { DataEngineerData } from '../types/data.types';

interface DataWorkspaceProps {
  data: DataEngineerData;
  activePipelineId?: string;
  onAcknowledgeAlert: (id: string) => void;
}

export const DataWorkspace: React.FC<DataWorkspaceProps> = ({ data, activePipelineId, onAcknowledgeAlert }) => {
  const [activeTab, setActiveTab] = useState('sources');

  const pipeline = data.pipelines.find(p => p.id === activePipelineId) || data.pipelines[0];
  const pipelineRules = data.qualityRules.filter(r => r.pipelineId === pipeline?.id);
  const firingAlerts = data.alerts.filter(a => a.status === 'Firing');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={pipeline?.name || 'Data Workspace'}
        subtitle={pipeline ? `${pipeline.type} · ${pipeline.sourceSystem} → ${pipeline.targetSystem} · ${pipeline.schedule}` : 'Select a pipeline'}
        action={
          pipeline && (
            <div className="flex gap-2">
              {pipeline.errorCount > 0 && (
                <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded-lg">
                  {pipeline.errorCount} errors
                </span>
              )}
              <span className="text-xs bg-white/5 border border-white/10 text-gray-300 px-2 py-1 rounded-lg">
                {pipeline.recordsProcessed > 0 ? `${(pipeline.recordsProcessed / 1000).toFixed(0)}K records` : pipeline.schedule}
              </span>
            </div>
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
            { id: 'sources', label: 'Data Sources', icon: <Database className="w-4 h-4" />, count: data.sources.length },
            { id: 'quality', label: 'Quality Rules', icon: <CheckSquare className="w-4 h-4" />, count: pipelineRules.filter(r => r.status !== 'Passed').length },
            { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" />, count: data.securityPolicies.length },
            { id: 'alerts', label: 'Alerts', icon: <Siren className="w-4 h-4" />, count: firingAlerts.length },
            { id: 'logs', label: 'Logs', icon: <ScrollText className="w-4 h-4" /> },
          ]}
        />

        {/* DATA SOURCES */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            {/* Lineage strip for selected pipeline */}
            {pipeline && (
              <div className="bg-surface rounded-xl border border-white/10 p-4 mb-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Data Lineage</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: pipeline.sourceSystem, type: 'source' },
                    { label: '→ Ingest', type: 'transform' },
                    { label: '→ Transform', type: 'transform' },
                    { label: '→ Validate', type: 'transform' },
                    { label: `→ ${pipeline.targetSystem}`, type: 'destination' },
                  ].map(({ label, type }, i) => (
                    <span key={i} className={cn("text-[10px] font-mono px-2 py-1 rounded border",
                      type === 'source' ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" :
                      type === 'destination' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                      "bg-white/5 text-gray-400 border-white/10"
                    )}>{label}</span>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-sm font-medium text-white mb-3">Connected Data Sources</h3>
            <div className="space-y-3">
              {data.sources.map(src => (
                <div key={src.id} className={cn("bg-surface rounded-xl border p-4",
                  src.status === 'Degraded' ? "border-amber-500/20 bg-amber-500/5" :
                  src.status === 'Disconnected' ? "border-red-500/20" : "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("w-2 h-2 rounded-full",
                          src.status === 'Connected' ? "bg-emerald-400" :
                          src.status === 'Degraded' ? "bg-amber-400 animate-pulse" : "bg-red-400"
                        )} />
                        <h4 className="text-sm font-medium text-white">{src.name}</h4>
                        <span className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">{src.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      {src.encryption && (
                        <span className="text-[10px] bg-teal-500/10 border border-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded">🔒 Encrypted</span>
                      )}
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border",
                        src.status === 'Connected' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        src.status === 'Degraded' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>{src.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Records Today', value: src.recordsToday > 0 ? (src.recordsToday / 1000).toFixed(0) + 'K' : '0' },
                      { label: 'Latency', value: `${src.latencyMs}ms`, warn: src.latencyMs > 500 },
                      { label: 'Last Sync', value: new Date(src.lastSyncAt).toLocaleTimeString() },
                    ].map(({ label, value, warn }) => (
                      <div key={label} className="bg-black/20 rounded p-2 border border-white/5">
                        <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
                        <p className={cn("text-xs font-bold", warn ? "text-amber-400" : "text-white")}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUALITY RULES */}
        {activeTab === 'quality' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">Data Quality Validation</h3>
              <span className="text-xs text-gray-400">{pipelineRules.filter(r => r.status === 'Passed').length}/{pipelineRules.length} passing</span>
            </div>
            {(pipelineRules.length > 0 ? pipelineRules : data.qualityRules).map(rule => (
              <div key={rule.id} className={cn("bg-surface rounded-xl border p-4",
                rule.status === 'Failed' ? "border-red-500/20 bg-red-500/5" :
                rule.status === 'Warning' ? "border-amber-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    {rule.status === 'Passed' ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> :
                     rule.status === 'Failed' ? <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> :
                     <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-white">{rule.rule}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{rule.description}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border ml-3 shrink-0",
                    rule.status === 'Passed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    rule.status === 'Failed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>{rule.status}</span>
                </div>
                {rule.failCount > 0 && (
                  <p className="text-xs text-red-300 mt-2">⚠ {rule.failCount} records failed this validation rule</p>
                )}
                <p className="text-[10px] text-gray-500 mt-2">Last checked: {new Date(rule.lastChecked).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Data Security & Compliance Policies</h3>
            {data.securityPolicies.map(policy => (
              <div key={policy.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                        policy.type === 'Encryption' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                        policy.type === 'Masking' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        policy.type === 'Audit Log' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                        policy.type === 'Retention' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-white/5 text-gray-400 border-white/10"
                      )}>{policy.type}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{policy.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Scope: {policy.scope}</p>
                  </div>
                  <ToggleRight className="w-6 h-6 text-emerald-400 shrink-0" />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Last audit: {new Date(policy.lastAudit).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {data.alerts.map(alert => (
              <div key={alert.id} className={cn("bg-surface rounded-xl border p-4",
                alert.severity === 'Critical' && alert.status === 'Firing' ? "border-red-500/30 bg-red-500/5" :
                "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2">
                    <Siren className={cn("w-4 h-4 shrink-0 mt-0.5", alert.severity === 'Critical' ? "text-red-400" : "text-amber-400")} />
                    <div>
                      <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{alert.detail}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border ml-3 shrink-0",
                    alert.status === 'Firing' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>{alert.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">{new Date(alert.firedAt).toLocaleTimeString()}</p>
                  {alert.status === 'Firing' && (
                    <Button size="sm" variant="outline" className="text-[10px] border-white/10 text-white h-7 px-2"
                      onClick={() => onAcknowledgeAlert(alert.id)}>Acknowledge</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOGS */}
        {activeTab === 'logs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Pipeline Logs</h3>
              <span className="flex items-center gap-1.5 text-[10px] text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />Live
              </span>
            </div>
            <div className="bg-black/40 rounded-xl border border-white/[0.06] p-4 font-mono text-xs space-y-2.5 overflow-y-auto max-h-[480px]">
              {data.logs.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="text-gray-600 shrink-0 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={cn("shrink-0 font-bold text-[10px] px-1.5 py-0.5 rounded",
                    log.level === 'ERROR' ? "bg-red-500/20 text-red-400" :
                    log.level === 'WARN' ? "bg-amber-500/20 text-amber-400" :
                    "bg-white/5 text-gray-400"
                  )}>{log.level}</span>
                  <span className="text-indigo-300 shrink-0 text-[10px]">{log.pipelineId}</span>
                  <span className={cn("leading-relaxed", log.level === 'ERROR' ? "text-red-300" : log.level === 'WARN' ? "text-amber-200" : "text-gray-300")}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
