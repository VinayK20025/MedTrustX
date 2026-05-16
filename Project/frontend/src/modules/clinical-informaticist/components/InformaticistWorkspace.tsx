'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ShieldAlert, BookOpen, Activity, AlertTriangle, TrendingUp, TrendingDown, BellRing, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { InformaticistData } from '../types/informaticist.types';

interface InformaticistWorkspaceProps {
  data: InformaticistData;
  onDismissAlert: (id: string) => void;
  onTuneCDSSRule: (id: string) => void;
}

export const InformaticistWorkspace: React.FC<InformaticistWorkspaceProps> = ({ data, onDismissAlert, onTuneCDSSRule }) => {
  const [activeTab, setActiveTab] = useState('cdss');
  const activeAlerts = data.alerts.filter(a => a.severity === 'Critical' || a.actionRequired);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Clinical Informatics Hub"
        subtitle="Decision support, standardizations, and UX metrics"
      />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'cdss', label: 'CDSS Engine', icon: <BellRing className="w-4 h-4" /> },
            { id: 'standards', label: 'Standardization', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'quality', label: 'Data Quality', icon: <ShieldAlert className="w-4 h-4" /> },
            { id: 'ux', label: 'UX Analytics', icon: <Activity className="w-4 h-4" /> },
            { id: 'alerts', label: 'Smart Alerts', icon: <AlertTriangle className="w-4 h-4" />, count: activeAlerts.length },
          ]}
        />

        {/* CDSS ENGINE */}
        {activeTab === 'cdss' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">Clinical Decision Support Systems</h3>
              <span className="text-xs text-gray-400">Total Fired Today: {data.metrics.cdssFiredToday}</span>
            </div>
            {data.cdssRules.map(rule => (
              <div key={rule.id} className={cn("bg-surface rounded-xl border p-4",
                rule.status === 'Active' ? "border-indigo-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-500">{rule.id}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                        rule.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>{rule.status}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">{rule.type}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{rule.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-1">{rule.description}</p>
                  </div>
                  {rule.status === 'Active' && (
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2 border-indigo-500/30 text-indigo-400" onClick={() => onTuneCDSSRule(rule.id)}>
                      <Settings2 className="w-3 h-3 mr-1" /> Tune Rule
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Alerts Fired</p>
                    <p className="text-sm font-bold text-white mt-1">{rule.alertsFiredToday}</p>
                  </div>
                  <div className={cn("bg-black/20 rounded p-2 text-center border",
                    rule.overrideRate > 20 ? "border-red-500/30" : "border-white/5"
                  )}>
                    <p className="text-[9px] text-gray-500 uppercase">Override Rate</p>
                    <p className={cn("text-sm font-bold mt-1",
                      rule.overrideRate > 20 ? "text-red-400" : "text-emerald-400"
                    )}>{rule.overrideRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STANDARDIZATION */}
        {activeTab === 'standards' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Semantic Data Mapping</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">EHR Field</th>
                    <th className="p-3 font-medium">Code System</th>
                    <th className="p-3 font-medium">Compliance</th>
                    <th className="p-3 font-medium">Mapping Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.standardizationRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-xs text-white">{rule.field}</td>
                      <td className="p-3">
                        <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                          {rule.codeSystem}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-bold", rule.complianceRate > 95 ? "text-emerald-400" : "text-amber-400")}>
                            {rule.complianceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={cn("text-[11px] font-bold", rule.mappingErrors > 50 ? "text-red-400" : "text-gray-400")}>
                          {rule.mappingErrors}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DATA QUALITY */}
        {activeTab === 'quality' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">EHR Data Quality Monitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.qualityMetrics.map(metric => (
                <div key={metric.id} className="bg-surface rounded-xl border border-white/10 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-white">{metric.metric}</h4>
                    {metric.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : metric.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-400" /> : <TrendingUp className="w-4 h-4 text-gray-500 opacity-50" />}
                  </div>
                  <div className="flex items-end gap-3 mt-4">
                    <span className={cn("text-3xl font-bold",
                      metric.score > 90 ? "text-emerald-400" : metric.score > 70 ? "text-amber-400" : "text-red-400"
                    )}>{metric.score}%</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border mb-1.5",
                      metric.status === 'Excellent' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      metric.status === 'Good' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                      metric.status === 'Needs Improvement' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>{metric.status}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                    <div className={cn("h-full rounded-full",
                      metric.score > 90 ? "bg-emerald-500" : metric.score > 70 ? "bg-amber-500" : "bg-red-500"
                    )} style={{ width: `${metric.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UX ANALYTICS */}
        {activeTab === 'ux' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Clinician UX & Efficiency Metrics</h3>
            {data.uxMetrics.map(ux => (
              <div key={ux.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <h4 className="text-sm font-medium text-white mb-4">{ux.taskName}</h4>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Avg Clicks</p>
                    <p className={cn("text-sm font-bold mt-1", ux.avgClicks > 20 ? "text-amber-400" : "text-white")}>{ux.avgClicks}</p>
                  </div>
                  <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Avg Time</p>
                    <p className={cn("text-sm font-bold mt-1", ux.avgTimeMins > 5 ? "text-amber-400" : "text-white")}>{ux.avgTimeMins}m</p>
                  </div>
                  <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Error Rate</p>
                    <p className={cn("text-sm font-bold mt-1", ux.errorRate > 5 ? "text-red-400" : "text-emerald-400")}>{ux.errorRate}%</p>
                  </div>
                  <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Satisfaction</p>
                    <p className={cn("text-sm font-bold mt-1", ux.satisfactionScore < 7 ? "text-red-400" : "text-emerald-400")}>{ux.satisfactionScore}/10</p>
                  </div>
                </div>
              </div>
            ))}
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
                      <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[10px] text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  {alert.actionRequired && (
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => onDismissAlert(alert.id)}>
                      Dismiss
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
