'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Cpu, FlaskConical, Shield, Zap, CheckCircle, XCircle, Clock, Lightbulb, PlayCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { DeveloperData, MicroService } from '../types/developer.types';

interface DevWorkspaceProps {
  data: DeveloperData;
  activeServiceId?: string;
  onRunTests: (suiteId: string) => void;
  onResolveIssue: (issueId: string) => void;
}

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  POST: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  PATCH: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const issueSeverityConfig: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const issueTypeConfig: Record<string, string> = {
  Security: 'text-red-400',
  Bug: 'text-rose-400',
  Performance: 'text-amber-400',
  'Code Smell': 'text-gray-400',
};

export const DevWorkspace: React.FC<DevWorkspaceProps> = ({ data, activeServiceId, onRunTests, onResolveIssue }) => {
  const [activeTab, setActiveTab] = useState('apis');

  const svc = data.services.find(s => s.id === activeServiceId) || data.services[0];
  const svcEndpoints = data.endpoints.filter(e => e.serviceId === svc?.id);
  const svcSuites = data.testSuites.filter(t => t.serviceId === svc?.id);
  const svcIssues = data.codeIssues.filter(i => i.serviceId === svc?.id);
  const svcBuilds = data.builds.filter(b => b.serviceId === svc?.id);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={svc?.name || 'Development Workspace'}
        subtitle={svc ? `${svc.language} · ${svc.framework} · ${svc.version}` : 'Select a service'}
        action={
          svc && (
            <div className="flex items-center gap-2">
              {svc.openIssues > 0 && (
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                  {svc.openIssues} open issues
                </span>
              )}
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                {svc.coverage}% coverage
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
            { id: 'apis', label: 'API Endpoints', icon: <Cpu className="w-4 h-4" />, count: svcEndpoints.length },
            { id: 'tests', label: 'Test Suites', icon: <FlaskConical className="w-4 h-4" />, count: svcSuites.length },
            { id: 'security', label: 'Code Analysis', icon: <Shield className="w-4 h-4" />, count: svcIssues.filter(i => i.status === 'Open').length },
            { id: 'builds', label: 'Builds', icon: <Zap className="w-4 h-4" />, count: svcBuilds.length },
          ]}
        />

        {/* API ENDPOINTS */}
        {activeTab === 'apis' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">API Endpoints</h3>
              <span className="text-xs text-gray-400">OpenAPI / Swagger spec auto-generated</span>
            </div>

            {svcEndpoints.map(ep => (
              <div key={ep.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border font-mono", methodColors[ep.method])}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono text-white">{ep.path}</code>
                    {ep.authRequired && (
                      <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                        🔒 Auth
                      </span>
                    )}
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border ml-2 shrink-0",
                    ep.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    ep.status === 'Draft' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-gray-500/10 text-gray-400 border-gray-500/20"
                  )}>{ep.status}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{ep.description}</p>
                {ep.callsToday > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/20 rounded p-2 border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">Calls Today</p>
                      <p className="text-sm font-bold text-white">{ep.callsToday.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/20 rounded p-2 border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">Avg Latency</p>
                      <p className={cn("text-sm font-bold", ep.avgLatencyMs > 500 ? "text-amber-400" : "text-white")}>{ep.avgLatencyMs}ms</p>
                    </div>
                    <div className="bg-black/20 rounded p-2 border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">Error Rate</p>
                      <p className={cn("text-sm font-bold", ep.errorRate > 1 ? "text-rose-400" : "text-emerald-400")}>{ep.errorRate}%</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {svcEndpoints.length === 0 && <p className="text-sm text-gray-500">No endpoints registered for this service.</p>}
          </div>
        )}

        {/* TEST SUITES */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Test Suites</h3>
            {svcSuites.map(suite => {
              const passRate = suite.totalTests > 0 ? Math.round((suite.passedTests / suite.totalTests) * 100) : 0;
              return (
                <div key={suite.id} className={cn(
                  "bg-surface rounded-xl border p-4",
                  suite.status === 'Failed' ? "border-rose-500/20" :
                  suite.status === 'Running' ? "border-indigo-500/20" : "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">{suite.type}</span>
                        <h4 className="text-sm font-medium text-white">{suite.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-3 shrink-0">
                      {suite.status === 'Running' ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                      ) : suite.status === 'Passed' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className={cn("text-xs font-bold",
                        suite.status === 'Passed' ? "text-emerald-400" :
                        suite.status === 'Running' ? "text-indigo-400" : "text-rose-400"
                      )}>{suite.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                    {[
                      { label: 'Total', value: suite.totalTests, color: 'text-white' },
                      { label: 'Passed', value: suite.passedTests, color: 'text-emerald-400' },
                      { label: 'Failed', value: suite.failedTests, color: suite.failedTests > 0 ? 'text-rose-400' : 'text-gray-400' },
                      { label: 'Pass Rate', value: `${passRate}%`, color: passRate === 100 ? 'text-emerald-400' : passRate >= 90 ? 'text-amber-400' : 'text-rose-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-black/20 rounded p-2 border border-white/5">
                        <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
                        <p className={cn("text-sm font-bold", color)}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {suite.coverage > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-500">Code Coverage</span>
                        <span className={cn("font-bold", suite.coverage >= 80 ? "text-emerald-400" : "text-amber-400")}>{suite.coverage}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", suite.coverage >= 80 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${suite.coverage}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      {suite.durationSeconds > 0 && <span><Clock className="w-3 h-3 inline mr-0.5" />{suite.durationSeconds}s</span>}
                      <span>Last run: {new Date(suite.lastRun).toLocaleTimeString()}</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-[10px] border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 h-7 px-2"
                      onClick={() => onRunTests(suite.id)}>
                      <PlayCircle className="w-3 h-3 mr-1" /> Run
                    </Button>
                  </div>
                </div>
              );
            })}
            {svcSuites.length === 0 && <p className="text-sm text-gray-500">No test suites for this service.</p>}
          </div>
        )}

        {/* CODE SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">Code Security Analysis</h3>
              <span className="text-xs text-gray-400">{svcIssues.filter(i => i.status === 'Open').length} open issues</span>
            </div>
            {svcIssues.map(issue => (
              <div key={issue.id} className={cn(
                "bg-surface rounded-xl border p-4",
                issue.severity === 'Critical' ? "border-red-500/30 bg-red-500/5" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn("text-[10px] font-bold", issueTypeConfig[issue.type])}>● {issue.type}</span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", issueSeverityConfig[issue.severity])}>
                        {issue.severity}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{issue.title}</h4>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0",
                    issue.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    issue.status === 'Accepted' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    "bg-white/5 text-gray-400 border-white/10"
                  )}>{issue.status}</span>
                </div>

                <p className="text-[10px] font-mono text-indigo-300 mb-3">
                  📍 {issue.file}:{issue.line}
                </p>

                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-200">{issue.suggestion}</p>
                  </div>
                </div>

                {issue.status === 'Open' && (
                  <Button size="sm" variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 h-7 px-3"
                    onClick={() => onResolveIssue(issue.id)}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Mark Resolved
                  </Button>
                )}
              </div>
            ))}
            {svcIssues.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-400 font-medium">No issues detected</p>
                <p className="text-xs text-gray-500 mt-1">This service is clean!</p>
              </div>
            )}
          </div>
        )}

        {/* BUILDS */}
        {activeTab === 'builds' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Build History</h3>
            {svcBuilds.map(build => (
              <div key={build.id} className={cn(
                "bg-surface rounded-xl border p-4",
                build.status === 'Failed' ? "border-rose-500/20" :
                build.status === 'Running' ? "border-indigo-500/20" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 mb-0.5">{build.id}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-indigo-300">{build.version}</span>
                      <span className="text-xs text-gray-500">by {build.triggeredBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {build.status === 'Running' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                    ) : build.status === 'Success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={cn("text-xs font-bold",
                      build.status === 'Success' ? "text-emerald-400" :
                      build.status === 'Running' ? "text-indigo-400" :
                      build.status === 'Queued' ? "text-gray-400" : "text-rose-400"
                    )}>{build.status}</span>
                  </div>
                </div>

                {build.testsPassed + build.testsFailed > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-black/20 rounded p-2 border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">Tests Passed</p>
                      <p className="text-sm font-bold text-emerald-400">{build.testsPassed}</p>
                    </div>
                    <div className="bg-black/20 rounded p-2 border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">Tests Failed</p>
                      <p className={cn("text-sm font-bold", build.testsFailed > 0 ? "text-rose-400" : "text-gray-400")}>{build.testsFailed}</p>
                    </div>
                    <div className="bg-black/20 rounded p-2 border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">Coverage</p>
                      <p className="text-sm font-bold text-white">{build.coverage}%</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <span>{new Date(build.startedAt).toLocaleTimeString()}</span>
                  {build.durationSeconds > 0 && <span>{Math.floor(build.durationSeconds / 60)}m {build.durationSeconds % 60}s</span>}
                </div>
              </div>
            ))}
            {svcBuilds.length === 0 && <p className="text-sm text-gray-500">No build history for this service.</p>}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
