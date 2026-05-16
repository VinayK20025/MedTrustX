'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { FlaskConical, Bug, Shield, CheckSquare, Siren, CheckCircle, XCircle, Lightbulb, ToggleRight, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { DevSecOpsData, ScanType } from '../types/devsecops.types';

interface SecurityWorkspaceProps {
  data: DevSecOpsData;
  activePipelineId?: string;
  onAcceptVuln: (id: string) => void;
  onTogglePolicy: (id: string, status: string) => void;
  onAcknowledgeAlert: (id: string) => void;
}

const scanTypeConfig: Record<ScanType, { label: string; color: string; bg: string }> = {
  'SAST':           { label: 'SAST', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  'DAST':           { label: 'DAST', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  'SCA':            { label: 'SCA', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'Secret Scan':    { label: 'Secrets', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  'Container Scan': { label: 'Container', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
};

const vulnSeverityConfig: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Info: 'bg-white/5 text-gray-400 border-white/10',
};

export const SecurityWorkspace: React.FC<SecurityWorkspaceProps> = ({ data, activePipelineId, onAcceptVuln, onTogglePolicy, onAcknowledgeAlert }) => {
  const [activeTab, setActiveTab] = useState('scans');
  const filteredScans = activePipelineId
    ? data.scans.filter(s => s.pipelineId === activePipelineId)
    : data.scans;

  const openVulns = data.vulnerabilities.filter(v => v.status === 'Open' || v.status === 'In Remediation');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Security Workspace"
        subtitle="Shift-Left Security & Compliance Automation"
        action={
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg">
              Score: {data.metrics.complianceScore}%
            </span>
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded-lg">
              {data.metrics.blockedDeployments} Blocked
            </span>
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
            { id: 'scans', label: 'Security Scans', icon: <FlaskConical className="w-4 h-4" />, count: filteredScans.length },
            { id: 'vulnerabilities', label: 'Vulnerabilities', icon: <Bug className="w-4 h-4" />, count: openVulns.length },
            { id: 'policies', label: 'Security Policies', icon: <Shield className="w-4 h-4" />, count: data.policies.filter(p => p.status === 'Active').length },
            { id: 'compliance', label: 'Compliance', icon: <CheckSquare className="w-4 h-4" /> },
            { id: 'alerts', label: 'Alerts', icon: <Siren className="w-4 h-4" />, count: data.alerts.filter(a => a.status === 'Firing').length },
          ]}
        />

        {/* SECURITY SCANS */}
        {activeTab === 'scans' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">
                {activePipelineId ? `Scans for ${activePipelineId}` : 'All Security Scans'}
              </h3>
            </div>

            {/* Scan type legend */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.entries(scanTypeConfig) as [ScanType, typeof scanTypeConfig[ScanType]][]).map(([type, cfg]) => (
                <span key={type} className={cn("text-[10px] px-2 py-0.5 rounded border font-bold", cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {filteredScans.map(scan => {
                const tcfg = scanTypeConfig[scan.scanType];
                return (
                  <div key={scan.id} className="bg-surface rounded-xl border border-white/10 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold", tcfg.bg, tcfg.color)}>
                          {scan.scanType}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{scan.application}</p>
                          <p className="text-[10px] font-mono text-gray-500">{scan.branch}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {scan.status === 'Passed'
                          ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                          : <XCircle className="w-4 h-4 text-red-400" />
                        }
                        <span className={cn("text-xs font-bold", scan.status === 'Passed' ? "text-emerald-400" : "text-red-400")}>
                          {scan.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-black/20 rounded p-2 border border-white/5">
                        <p className="text-gray-500 mb-0.5 text-[10px]">Total Issues</p>
                        <p className={cn("font-bold text-lg", scan.issuesFound > 0 ? "text-amber-400" : "text-emerald-400")}>
                          {scan.issuesFound}
                        </p>
                      </div>
                      <div className="bg-black/20 rounded p-2 border border-white/5">
                        <p className="text-gray-500 mb-0.5 text-[10px]">Critical</p>
                        <p className={cn("font-bold text-lg", scan.criticalCount > 0 ? "text-red-400" : "text-gray-400")}>
                          {scan.criticalCount}
                        </p>
                      </div>
                      <div className="bg-black/20 rounded p-2 border border-white/5">
                        <p className="text-gray-500 mb-0.5 text-[10px]">Duration</p>
                        <p className="font-bold text-white">{scan.durationSeconds}s</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredScans.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">Select a pipeline to view its scans.</p>
              )}
            </div>
          </div>
        )}

        {/* VULNERABILITIES */}
        {activeTab === 'vulnerabilities' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">Open Vulnerabilities</h3>
              <span className="text-xs text-gray-400">{openVulns.length} open · {data.vulnerabilities.filter(v => v.status === 'Fixed').length} fixed</span>
            </div>

            {data.vulnerabilities.map(vuln => (
              <div key={vuln.id} className={cn(
                "bg-surface rounded-xl border p-4",
                vuln.severity === 'Critical' ? "border-red-500/30 bg-red-500/5" :
                vuln.severity === 'High' ? "border-rose-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      {vuln.cveId && (
                        <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">
                          {vuln.cveId}
                        </span>
                      )}
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", vulnSeverityConfig[vuln.severity])}>
                        {vuln.severity}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{vuln.title}</h4>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0",
                    vuln.status === 'Fixed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    vuln.status === 'In Remediation' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    vuln.status === 'Accepted' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    "bg-white/5 text-gray-400 border-white/10"
                  )}>{vuln.status}</span>
                </div>

                <p className="text-xs text-gray-300 mb-3 leading-relaxed">{vuln.description}</p>

                {(vuln.affectedFile || vuln.affectedDependency) && (
                  <p className="text-[10px] font-mono text-gray-500 mb-3">
                    📍 {vuln.affectedFile || vuln.affectedDependency}
                  </p>
                )}

                {/* Auto-remediation suggestion */}
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-200">{vuln.remediationSuggestion}</p>
                  </div>
                </div>

                {vuln.status === 'Open' && (
                  <Button size="sm" variant="outline" className="text-[10px] border-white/10 text-gray-300 h-7 px-3"
                    onClick={() => onAcceptVuln(vuln.id)}>
                    Accept Risk
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Security Policy Gates</h3>
            {data.policies.map(policy => (
              <div key={policy.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                        policy.action === 'Block' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        policy.action === 'Warn' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      )}>{policy.action}</span>
                      <span className="text-[10px] text-gray-500">{policy.standard}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{policy.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{policy.description}</p>
                  </div>
                  <button
                    onClick={() => onTogglePolicy(policy.id, policy.status === 'Active' ? 'Inactive' : 'Active')}
                    className="ml-3 shrink-0"
                  >
                    {policy.status === 'Active'
                      ? <ToggleRight className="w-6 h-6 text-emerald-400" />
                      : <ToggleLeft className="w-6 h-6 text-gray-500" />
                    }
                  </button>
                </div>
                <div className="bg-black/20 rounded-lg p-2 border border-white/5 mb-3">
                  <p className="text-[10px] font-mono text-indigo-300">{policy.rule}</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <span>Blocked <span className="text-red-400 font-bold">{policy.blockCount}</span> deployments</span>
                  {policy.lastTriggered && <span>Last triggered: {new Date(policy.lastTriggered).toLocaleTimeString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Automated Compliance Controls</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Standard</th>
                    <th className="pb-3 px-4">Control</th>
                    <th className="pb-3 px-4">Auto Check</th>
                    <th className="pb-3 px-4">Last Checked</th>
                    <th className="pb-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {data.complianceControls.map((ctrl, i) => (
                    <tr key={i} className="text-sm text-gray-300 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-xs">{ctrl.standard}</td>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium text-xs">{ctrl.control}</p>
                        <p className="text-gray-500 text-[10px]">{ctrl.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        {ctrl.automatedCheck
                          ? <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Automated</span>
                          : <span className="text-[10px] text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">Manual</span>
                        }
                      </td>
                      <td className="py-3 px-4 text-[10px] text-gray-500">{new Date(ctrl.lastChecked).toLocaleTimeString()}</td>
                      <td className="py-3 pl-4 text-right">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded border uppercase font-bold",
                          ctrl.status === 'Compliant' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          ctrl.status === 'Non-Compliant' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>{ctrl.status}</span>
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
              <div key={alert.id} className={cn(
                "bg-surface rounded-xl border p-4",
                alert.severity === 'Critical' && alert.status === 'Firing' ? "border-red-500/30 bg-red-500/5" :
                alert.severity === 'High' ? "border-rose-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded shrink-0",
                      alert.severity === 'Critical' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      <Siren className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{alert.application}</p>
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
      </CardBody>
    </Card>
  );
};
