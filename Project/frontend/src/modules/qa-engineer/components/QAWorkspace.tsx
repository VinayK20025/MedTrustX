'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Bug, Shield, BarChart3, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { QAData, TestSuite } from '../types/qa.types';

interface QAWorkspaceProps {
  data: QAData;
  activeSuiteId?: string;
}

const severityConfig: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export const QAWorkspace: React.FC<QAWorkspaceProps> = ({ data, activeSuiteId }) => {
  const [activeTab, setActiveTab] = useState('cases');
  const suite = data.suites.find(s => s.id === activeSuiteId) || data.suites[0];
  const filteredCases = suite ? data.cases.filter(c => c.suiteId === suite.id) : data.cases;
  const openDefects = data.defects.filter(d => d.status !== 'Closed' && d.status !== 'Resolved');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={suite?.name || 'QA Workspace'}
        subtitle={suite ? `${suite.type} · ${suite.module} · ${suite.totalCases} cases` : 'Select a test suite'}
        action={suite && (
          <div className="flex gap-2">
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg">{suite.coverage}% coverage</span>
            {suite.failed > 0 && <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-1 rounded-lg">{suite.failed} failing</span>}
          </div>
        )}
      />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'cases', label: 'Test Cases', count: filteredCases.length },
            { id: 'defects', label: 'Defects', icon: <Bug className="w-4 h-4" />, count: openDefects.length },
            { id: 'security', label: 'Security Tests', icon: <Shield className="w-4 h-4" />, count: data.securityFindings.filter(f => f.status === 'Open').length },
            { id: 'coverage', label: 'Coverage', icon: <BarChart3 className="w-4 h-4" /> },
          ]}
        />

        {activeTab === 'cases' && (
          <div className="space-y-3">
            {filteredCases.map(tc => (
              <div key={tc.id} className={cn("bg-surface rounded-xl border p-4",
                tc.status === 'Failed' ? "border-rose-500/20 bg-rose-500/5" :
                tc.status === 'Blocked' ? "border-amber-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    {tc.status === 'Passed' ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> :
                     tc.status === 'Failed' ? <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> :
                     <div className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-white">{tc.title}</p>
                      <p className="text-[10px] font-mono text-gray-500">{tc.id} · {tc.type}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border ml-2 shrink-0",
                    tc.status === 'Passed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    tc.status === 'Failed' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>{tc.status}</span>
                </div>
                {tc.errorMessage && (
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg px-3 py-2 mt-2">
                    <p className="text-xs font-mono text-rose-300 leading-relaxed">{tc.errorMessage}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
                  {tc.duration > 0 && <span>{(tc.duration / 1000).toFixed(1)}s</span>}
                  {tc.linkedDefect && <span className="text-amber-400">→ {tc.linkedDefect}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'defects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">Open Defects</h3>
              <span className="text-xs text-gray-400">{openDefects.length} open · {data.defects.filter(d => d.status === 'Resolved').length} resolved</span>
            </div>
            {data.defects.map(defect => (
              <div key={defect.id} className={cn("bg-surface rounded-xl border p-4",
                defect.severity === 'Critical' ? "border-red-500/30 bg-red-500/5" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", severityConfig[defect.severity])}>{defect.severity}</span>
                      <span className="text-[10px] text-gray-500">{defect.module}</span>
                      {defect.linkedTestCase && <span className="text-[10px] text-indigo-400 font-mono">{defect.linkedTestCase}</span>}
                    </div>
                    <h4 className="text-sm font-medium text-white">{defect.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{defect.description}</p>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0",
                    defect.status === 'Open' ? "bg-white/5 text-gray-400 border-white/10" :
                    defect.status === 'In Fix' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                    defect.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>{defect.status}</span>
                </div>
                <div className="bg-black/20 rounded-lg px-3 py-2 border border-white/5 mb-2">
                  <p className="text-[10px] text-gray-400 whitespace-pre-line font-mono leading-relaxed">{defect.stepsToReproduce}</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <span>Assignee: <span className="text-white">{defect.assignee}</span></span>
                  <span>{new Date(defect.detectedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Security Test Findings</h3>
            {data.securityFindings.map(finding => (
              <div key={finding.id} className={cn("bg-surface rounded-xl border p-4",
                finding.severity === 'Critical' && finding.status === 'Open' ? "border-red-500/30 bg-red-500/5" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", severityConfig[finding.severity])}>{finding.severity}</span>
                      <span className="text-[10px] text-gray-500">{finding.type}</span>
                      {finding.cveId && <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">{finding.cveId}</span>}
                    </div>
                    <h4 className="text-sm font-medium text-white">{finding.title}</h4>
                    <p className="text-[10px] font-mono text-gray-500 mt-1">{finding.endpoint}</p>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0",
                    finding.status === 'Fixed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    finding.status === 'Accepted' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    "bg-white/5 text-gray-400 border-white/10"
                  )}>{finding.status}</span>
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-200">{finding.remediation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'coverage' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Test Coverage by Module</h3>
            {data.coverage.map(mod => {
              const automationPct = mod.totalCases > 0 ? Math.round((mod.automated / mod.totalCases) * 100) : 0;
              return (
                <div key={mod.module} className="bg-surface rounded-xl border border-white/10 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-white">{mod.module}</h4>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-gray-400">{mod.totalCases} cases</span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border",
                        mod.coverage >= 90 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        mod.coverage >= 70 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )}>{mod.coverage}%</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Test Coverage</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", mod.coverage >= 90 ? "bg-emerald-500" : mod.coverage >= 70 ? "bg-amber-500" : "bg-rose-500")}
                        style={{ width: `${mod.coverage}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Automation: <span className="text-indigo-300 font-bold">{mod.automated}/{mod.totalCases} ({automationPct}%)</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
