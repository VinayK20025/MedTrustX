'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Activity, Server, Database, GitBranch, RefreshCw, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { MlEngineerData } from '../types/ml.types';

interface MlWorkspaceProps {
  data: MlEngineerData;
  activeModelId?: string;
  onRetrain: (id: string) => void;
  onAcknowledgeAlert: (id: string) => void;
}

export const MlWorkspace: React.FC<MlWorkspaceProps> = ({ data, activeModelId, onRetrain, onAcknowledgeAlert }) => {
  const [activeTab, setActiveTab] = useState('monitoring');

  const model = data.models.find(m => m.id === activeModelId) || data.models[0];
  const experiments = data.experiments.filter(e => e.modelId === model?.id);
  const activeAlerts = data.alerts.filter(a => a.status === 'Active');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={model?.name || 'ML Workspace'}
        subtitle={model ? `${model.type} · ${model.framework} · ${model.version}` : 'Select a model'}
        action={
          model?.status === 'Deployed' && (
            <Button size="sm" variant="outline" className="text-xs border-indigo-500/20 text-indigo-400 h-8" onClick={() => onRetrain(model.id)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retrain
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
            { id: 'monitoring', label: 'Drift & Monitoring', icon: <Activity className="w-4 h-4" /> },
            { id: 'experiments', label: 'Experiments', icon: <GitBranch className="w-4 h-4" />, count: experiments.length },
            { id: 'training', label: 'Training Jobs', icon: <Cpu className="w-4 h-4" />, count: data.trainingJobs.filter(j => j.status === 'Running').length },
            { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" />, count: activeAlerts.length },
          ]}
        />

        {/* MONITORING & DRIFT */}
        {activeTab === 'monitoring' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">Feature Drift Analysis</h3>
              <span className="text-xs text-gray-400">Calculated via Population Stability Index (PSI)</span>
            </div>
            
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Feature Name</th>
                    <th className="p-3 font-medium">Importance</th>
                    <th className="p-3 font-medium">Drift Score</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.driftMetrics.map((metric, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-mono text-xs text-gray-300">{metric.featureName}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-24">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${metric.importance * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500">{metric.importance.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={cn("text-xs font-mono", metric.driftScore > 0.3 ? "text-amber-400" : metric.driftScore > 0.6 ? "text-red-400" : "text-emerald-400")}>
                          {metric.driftScore.toFixed(3)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold border",
                          metric.status === 'Normal' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          metric.status === 'Warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>{metric.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {model?.status === 'Deployed' && (
              <div className="mt-6 bg-surface rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" /> API Endpoint
                </h3>
                <div className="flex items-center gap-3 bg-black/30 border border-white/5 p-3 rounded-lg">
                  <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded">POST</span>
                  <span className="text-sm font-mono text-indigo-300 flex-1">{model.endpoint}</span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded">Online</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPERIMENTS */}
        {activeTab === 'experiments' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Experiment Tracking</h3>
            {experiments.map(exp => (
              <div key={exp.id} className="bg-surface rounded-xl border border-white/10 p-4 hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-white font-mono">{exp.runName}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">{exp.id} • {new Date(exp.timestamp).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-[10px] h-7 px-2">Promote to Staging</Button>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Accuracy', value: exp.accuracy },
                    { label: 'Precision', value: exp.precision },
                    { label: 'Recall', value: exp.recall },
                    { label: 'F1 Score', value: exp.f1Score },
                  ].map(metric => (
                    <div key={metric.label} className="bg-black/20 border border-white/5 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider">{metric.label}</p>
                      <p className={cn("text-sm font-bold mt-1", metric.value >= 90 ? "text-emerald-400" : "text-white")}>{metric.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {experiments.length === 0 && <p className="text-sm text-gray-500 italic">No experiments recorded for this model.</p>}
          </div>
        )}

        {/* TRAINING JOBS */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            {data.trainingJobs.map(job => (
              <div key={job.id} className={cn("bg-surface rounded-xl border p-4",
                job.status === 'Failed' ? "border-red-500/20 bg-red-500/5" :
                job.status === 'Running' ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-500">{job.id}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                        job.status === 'Running' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                        job.status === 'Completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {job.status === 'Running' && <RefreshCw className="w-2.5 h-2.5 inline mr-1 animate-spin" />}
                        {job.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{job.modelName}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Database className="w-3 h-3" /> {job.datasetName}</p>
                  </div>
                </div>

                {job.status === 'Running' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-indigo-300 font-mono">Epoch {job.currentEpoch}/{job.epochs}</span>
                      <span className="text-gray-400">{job.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 text-right">Est. remaining: {job.estimatedTimeLeft}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {data.alerts.map(alert => (
              <div key={alert.id} className={cn("bg-surface rounded-xl border p-4",
                alert.severity === 'Critical' && alert.status === 'Active' ? "border-red-500/30 bg-red-500/5" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className={cn("w-4 h-4 shrink-0 mt-0.5", alert.severity === 'Critical' ? "text-red-400" : "text-amber-400")} />
                    <div>
                      <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{alert.detail}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border ml-3 shrink-0",
                    alert.status === 'Active' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-white/5 text-gray-500 border-white/10"
                  )}>{alert.status}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[10px] text-gray-500">{new Date(alert.detectedAt).toLocaleString()}</p>
                  {alert.status === 'Active' && (
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => onAcknowledgeAlert(alert.id)}>
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
