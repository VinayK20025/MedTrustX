'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ShieldAlert, Scale, Eye, FileSearch, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { AiEthicsData } from '../types/ai-ethics.types';

interface EthicsWorkspaceProps {
  data: AiEthicsData;
  activeModelId?: string;
  onDismissAlert: (id: string) => void;
}

export const EthicsWorkspace: React.FC<EthicsWorkspaceProps> = ({ data, activeModelId, onDismissAlert }) => {
  const [activeTab, setActiveTab] = useState('bias');
  const activeAlerts = data.alerts.filter(a => a.severity === 'Critical' || a.actionRequired);

  const modelBias = activeModelId ? data.biasMetrics[activeModelId] || [] : [];
  const modelExplainability = activeModelId ? data.explainabilityData[activeModelId] || [] : [];

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="Ethics & Governance Workspace" subtitle={activeModelId ? `Analyzing Model: ${activeModelId}` : "Select a model to view detailed ethics metrics"} />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'bias', label: 'Bias Analysis', icon: <Scale className="w-4 h-4" />, disabled: !activeModelId },
            { id: 'explain', label: 'Explainability', icon: <Eye className="w-4 h-4" />, disabled: !activeModelId },
            { id: 'risk', label: 'Risk Assessment', icon: <FileSearch className="w-4 h-4" /> },
            { id: 'compliance', label: 'Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'alerts', label: 'Ethical Alerts', icon: <AlertTriangle className="w-4 h-4" />, count: activeAlerts.length },
          ]}
        />

        {/* BIAS ANALYSIS */}
        {activeTab === 'bias' && activeModelId && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Fairness & Bias Metrics</h3>
            {modelBias.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No bias metrics available for this model.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modelBias.map((metric, idx) => (
                  <div key={idx} className={cn("bg-surface rounded-xl border p-4",
                    metric.status === 'Fail' ? "border-red-500/30" :
                    metric.status === 'Warning' ? "border-amber-500/30" : "border-emerald-500/30"
                  )}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{metric.category}</span>
                        <h4 className="text-sm font-medium text-white mt-1">{metric.metricName}</h4>
                      </div>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                        metric.status === 'Fail' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        metric.status === 'Warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}>{metric.status}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Score: <strong className="text-white">{metric.score}</strong></span>
                        <span className="text-gray-500">Threshold: {metric.threshold}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex relative">
                        <div className={cn("h-full", metric.status === 'Fail' ? "bg-red-500" : metric.status === 'Warning' ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${metric.score * 100}%` }} />
                        <div className="absolute top-0 bottom-0 w-px bg-white z-10" style={{ left: `${metric.threshold * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EXPLAINABILITY (XAI) */}
        {activeTab === 'explain' && activeModelId && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">Model Explainability (SHAP Values)</h3>
            </div>
            {modelExplainability.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No explainability data available for this model.</p>
            ) : (
              <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3 font-medium">Feature</th>
                      <th className="p-3 font-medium">Global Impact</th>
                      <th className="p-3 font-medium">SHAP Value</th>
                      <th className="p-3 font-medium">Clinical Validity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {modelExplainability.map((feat, idx) => (
                      <tr key={idx} className={cn("transition-colors", !feat.isClinicallyValid ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-white/[0.02]")}>
                        <td className="p-3 text-xs font-medium text-white flex items-center gap-2">
                          {!feat.isClinicallyValid && <AlertTriangle className="w-3 h-3 text-red-400" title="Ethical concern: Non-clinical feature driving predictions" />}
                          {feat.feature}
                        </td>
                        <td className="p-3">
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold",
                            feat.impact === 'High' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                            feat.impact === 'Medium' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            "bg-white/5 text-gray-400 border-white/10"
                          )}>{feat.impact}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${feat.shapValue * 100 * 2}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">{feat.shapValue.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {feat.isClinicallyValid ? (
                            <span className="text-[10px] text-emerald-400 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Valid</span>
                          ) : (
                            <span className="text-[10px] text-red-400 font-bold flex items-center"><ShieldAlert className="w-3 h-3 mr-1" /> Flagged</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* RISK ASSESSMENT */}
        {activeTab === 'risk' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Systemic AI Risks</h3>
            <div className="grid grid-cols-1 gap-4">
              {data.risks.map((risk, idx) => (
                <div key={idx} className={cn("bg-surface rounded-xl border p-4",
                  risk.severity === 'High' && risk.status !== 'Mitigated' ? "border-red-500/30 bg-red-500/5" :
                  risk.severity === 'Medium' && risk.status !== 'Mitigated' ? "border-amber-500/30" : "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{risk.riskType}</h4>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                        risk.severity === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        risk.severity === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}>{risk.severity} Risk</span>
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                      risk.status === 'Mitigated' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      risk.status === 'Active' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    )}>{risk.status}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">{risk.description}</p>
                  <div className="mt-3 p-2.5 bg-black/30 rounded border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Mitigation Strategy</p>
                    <p className="text-xs text-indigo-300">{risk.mitigationStrategy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Regulatory Alignment</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Standard</th>
                    <th className="p-3 font-medium">Description</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Last Audited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.compliance.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-xs font-medium text-white">{comp.standard}</td>
                      <td className="p-3 text-xs text-gray-400">{comp.description}</td>
                      <td className="p-3">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold flex items-center w-fit",
                          comp.status === 'Compliant' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          comp.status === 'Non-Compliant' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          {comp.status === 'Compliant' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {comp.status}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-gray-500 font-mono">
                        {new Date(comp.lastChecked).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {data.alerts.map(alert => (
              <div key={alert.id} className={cn("bg-surface rounded-xl border p-4",
                alert.severity === 'Critical' ? "border-red-500/30 bg-red-500/5" :
                alert.severity === 'Warning' ? "border-amber-500/30 bg-amber-500/5" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={cn("w-4 h-4 shrink-0 mt-0.5",
                      alert.severity === 'Critical' ? "text-red-400" :
                      alert.severity === 'Warning' ? "text-amber-400" : "text-indigo-400"
                    )} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                        <span className="text-[9px] bg-white/10 border border-white/20 text-gray-300 px-1.5 py-0.5 rounded font-mono">Ref: {alert.modelId}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[10px] text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  {alert.actionRequired && (
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => onDismissAlert(alert.id)}>
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
