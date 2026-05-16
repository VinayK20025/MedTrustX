'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import {
  Rocket, Server, Siren, ScrollText, CheckCircle, XCircle, RotateCcw,
  Cpu, HardDrive, MemoryStick, AlertTriangle, ArrowRight, PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { DevOpsData, CicdPipeline, PipelineStage } from '../types/devops.types';

interface DeploymentWorkspaceProps {
  data: DevOpsData;
  activePipelineId?: string;
  onRollback: (id: string) => void;
  onAcknowledgeAlert: (id: string) => void;
  onTriggerPipeline: (id: string) => void;
}

const stageDetailConfig: Record<string, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
  Success: { icon: <CheckCircle className="w-4 h-4" />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  Running: { icon: <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />, bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  Failed: { icon: <XCircle className="w-4 h-4" />, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
  Pending: { icon: <div className="w-4 h-4 rounded-full bg-white/10" />, bg: 'bg-white/5', border: 'border-white/10', text: 'text-gray-500' },
  Skipped: { icon: <div className="w-4 h-4 rounded-full bg-white/5" />, bg: 'bg-white/5', border: 'border-white/10', text: 'text-gray-600' },
};

const PipelineDetailStages: React.FC<{ stages: PipelineStage[] }> = ({ stages }) => (
  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-4">
    {stages.map((stage, i) => {
      const cfg = stageDetailConfig[stage.status] || stageDetailConfig.Pending;
      const mins = Math.floor(stage.durationSeconds / 60);
      const secs = stage.durationSeconds % 60;
      return (
        <React.Fragment key={stage.name}>
          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border", cfg.bg, cfg.border)}>
            <span className={cfg.text}>{cfg.icon}</span>
            <div>
              <p className={cn("text-xs font-medium", cfg.text)}>{stage.name}</p>
              {stage.durationSeconds > 0 && (
                <p className="text-[10px] text-gray-500">{mins}m {secs}s</p>
              )}
            </div>
          </div>
          {i < stages.length - 1 && (
            <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 hidden md:block" />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const ResourceBar: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">{icon}{label}</div>
      <span className={cn("text-xs font-bold", value > 80 ? "text-rose-400" : value > 60 ? "text-amber-400" : "text-emerald-400")}>{value}%</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export const DeploymentWorkspace: React.FC<DeploymentWorkspaceProps> = ({ data, activePipelineId, onRollback, onAcknowledgeAlert, onTriggerPipeline }) => {
  const [activeTab, setActiveTab] = useState('pipeline-detail');
  const selectedPipeline = data.pipelines.find(p => p.id === activePipelineId) || data.pipelines[0];

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={selectedPipeline?.name || 'Deployment Workspace'}
        subtitle={selectedPipeline ? `${selectedPipeline.application} · branch: ${selectedPipeline.branch}` : 'Select a pipeline'}
        action={
          selectedPipeline && (
            <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white h-9"
              onClick={() => onTriggerPipeline(selectedPipeline.id)}>
              <PlayCircle className="w-4 h-4 mr-1.5" /> Re-Run
            </Button>
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
            { id: 'pipeline-detail', label: 'Pipeline Detail', icon: <PlayCircle className="w-4 h-4" /> },
            { id: 'deployments', label: 'Deployments', icon: <Rocket className="w-4 h-4" />, count: data.deployments.length },
            { id: 'infrastructure', label: 'Infrastructure', icon: <Server className="w-4 h-4" /> },
            { id: 'alerts', label: 'Alerts', icon: <Siren className="w-4 h-4" />, count: data.alerts.filter(a => a.status === 'Firing').length },
            { id: 'logs', label: 'Live Logs', icon: <ScrollText className="w-4 h-4" /> },
          ]}
        />

        {/* PIPELINE DETAIL */}
        {activeTab === 'pipeline-detail' && selectedPipeline && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-surface rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gray-400 mb-1">Pipeline ID</p>
                <p className="font-mono text-white">{selectedPipeline.id}</p>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gray-400 mb-1">Commit</p>
                <p className="font-mono text-indigo-300">{selectedPipeline.commitSha}</p>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gray-400 mb-1">Triggered By</p>
                <p className="text-white">{selectedPipeline.triggeredBy}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-2">Stage Workflow</h3>
              <PipelineDetailStages stages={selectedPipeline.stages} />
            </div>

            {selectedPipeline.status === 'Failed' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Pipeline Failed</p>
                    <p className="text-xs text-gray-300">
                      Stage <strong className="text-red-300">Security Scan</strong> failed. A CVE was detected in a dependency.
                      Review the SAST report and update the dependency before re-running.
                    </p>
                    <Button size="sm" variant="outline" className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 text-xs">
                      View Security Report
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEPLOYMENTS */}
        {activeTab === 'deployments' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Recent Deployments</h3>
            {data.deployments.map(dep => (
              <div key={dep.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 mb-0.5">{dep.id}</p>
                    <h4 className="text-sm font-medium text-white">{dep.application}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-indigo-300">{dep.version}</span>
                      <span className="text-gray-600">→</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                        dep.environment === 'Production' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                        dep.environment === 'Staging' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      )}>{dep.environment}</span>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase",
                    dep.status === 'Success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    dep.status === 'Failed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    dep.status === 'Rolled Back' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  )}>{dep.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-gray-500">
                    By {dep.deployedBy} · {new Date(dep.deployedAt).toLocaleTimeString()}
                    {dep.previousVersion && <span> · Prev: {dep.previousVersion}</span>}
                  </div>
                  {dep.rollbackAvailable && dep.status === 'Success' && (
                    <Button size="sm" variant="outline" className="text-[10px] border-amber-500/20 text-amber-400 hover:bg-amber-500/10 h-7 px-2"
                      onClick={() => onRollback(dep.id)}>
                      <RotateCcw className="w-3 h-3 mr-1" /> Rollback
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INFRASTRUCTURE */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Environment Health</h3>
            {data.environments.map(env => (
              <div key={env.id} className={cn(
                "bg-surface rounded-xl border p-4",
                env.status === 'Down' ? "border-red-500/20" :
                env.status === 'Degraded' ? "border-amber-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("w-2 h-2 rounded-full",
                        env.status === 'Running' ? "bg-emerald-400" :
                        env.status === 'Degraded' ? "bg-amber-400 animate-pulse" : "bg-red-400"
                      )} />
                      <h4 className="text-sm font-bold text-white">{env.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500">{env.provider} · {env.region}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-xs font-bold px-2 py-1 rounded border uppercase",
                      env.status === 'Running' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      env.status === 'Degraded' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>{env.status}</span>
                    <p className="text-[10px] text-gray-500 mt-1">{env.servicesHealthy}/{env.services} services healthy</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ResourceBar label="CPU" value={env.cpuUsage} icon={<Cpu className="w-3 h-3" />} color={env.cpuUsage > 80 ? "bg-rose-500" : env.cpuUsage > 60 ? "bg-amber-500" : "bg-emerald-500"} />
                  <ResourceBar label="Memory" value={env.memoryUsage} icon={<MemoryStick className="w-3 h-3" />} color={env.memoryUsage > 80 ? "bg-rose-500" : env.memoryUsage > 60 ? "bg-amber-500" : "bg-emerald-500"} />
                  <ResourceBar label="Disk" value={env.diskUsage} icon={<HardDrive className="w-3 h-3" />} color={env.diskUsage > 80 ? "bg-rose-500" : env.diskUsage > 60 ? "bg-amber-500" : "bg-teal-500"} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {data.alerts.map(alert => (
              <div key={alert.id} className={cn(
                "bg-surface rounded-xl border p-4",
                alert.severity === 'Critical' && alert.status === 'Firing' ? "border-red-500/30 bg-red-500/5" :
                alert.severity === 'Warning' ? "border-amber-500/20" : "border-white/10"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded mt-0.5 shrink-0",
                      alert.severity === 'Critical' ? "bg-red-500/20 text-red-400" :
                      alert.severity === 'Warning' ? "bg-amber-500/20 text-amber-400" :
                      "bg-teal-500/20 text-teal-400"
                    )}>
                      {alert.severity === 'Critical' ? <Siren className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{alert.service} · {alert.environment}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-3 shrink-0">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                      alert.severity === 'Critical' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>{alert.severity}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                      alert.status === 'Firing' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      alert.status === 'Acknowledged' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>{alert.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">Fired: {new Date(alert.firedAt).toLocaleTimeString()}</p>
                  {alert.status === 'Firing' && (
                    <Button size="sm" variant="outline" className="text-[10px] border-white/10 text-white h-7 px-2"
                      onClick={() => onAcknowledgeAlert(alert.id)}>
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIVE LOGS */}
        {activeTab === 'logs' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-white">Live System Logs</h3>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <div className="bg-[#0a0a0f] rounded-xl border border-white/10 p-4 font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto">
              {data.logs.map((log, i) => (
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-gray-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={cn("shrink-0 font-bold w-10",
                    log.level === 'ERROR' ? "text-red-400" :
                    log.level === 'WARN' ? "text-amber-400" : "text-gray-500"
                  )}>{log.level}</span>
                  <span className="text-indigo-300 shrink-0">[{log.service}]</span>
                  <span className={cn(log.level === 'ERROR' ? "text-red-200" : log.level === 'WARN' ? "text-amber-200" : "text-gray-300")}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
