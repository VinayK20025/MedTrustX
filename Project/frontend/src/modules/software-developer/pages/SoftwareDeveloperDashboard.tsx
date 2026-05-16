'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProjectPanel } from '../components/ProjectPanel';
import { DevWorkspace } from '../components/DevWorkspace';
import { useDevDashboard, useRunTests, useTriggerBuild, useResolveIssue } from '../hooks/useDevAnalytics';
import { Zap, FlaskConical, Shield, BarChart3, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const SoftwareDeveloperDashboard: React.FC = () => {
  const { data, isLoading } = useDevDashboard();
  const runTests = useRunTests();
  const triggerBuild = useTriggerBuild();
  const resolveIssue = useResolveIssue();
  const [activeServiceId, setActiveServiceId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading developer workspace...</div>;
  }

  const { data: devData } = data;
  const hasFailedBuild = devData.builds.some(b => b.status === 'Failed');
  const criticalIssues = devData.codeIssues.filter(i => i.severity === 'Critical' && i.status === 'Open');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Engineering' }, { label: 'Developer Dashboard' }]} />

        {/* Alert banners */}
        {criticalIssues.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>Critical Code Issues:</strong> {criticalIssues.length} critical security vulnerability(s) detected — remediation required before deployment.
            </span>
          </div>
        )}
        {hasFailedBuild && !criticalIssues.length && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Build Failures:</strong> {devData.builds.filter(b => b.status === 'Failed').length} service build(s) failed. Review test failures and code issues.
            </span>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Active Services', value: devData.metrics.activeServices, icon: Zap, color: 'indigo' },
            { label: 'Build Success', value: `${devData.metrics.buildSuccessRate}%`, icon: Zap, color: devData.metrics.buildSuccessRate >= 90 ? 'emerald' : 'amber' },
            { label: 'Avg Coverage', value: `${devData.metrics.avgCodeCoverage}%`, icon: BarChart3, color: devData.metrics.avgCodeCoverage >= 80 ? 'teal' : 'amber' },
            { label: 'Open Issues', value: devData.metrics.openIssues, icon: Shield, color: 'rose' },
            { label: 'Deployments', value: devData.metrics.deploymentsToday, icon: Zap, color: 'purple' },
            { label: 'Failed Builds', value: devData.metrics.failedBuildsToday, icon: XCircle, color: hasFailedBuild ? 'red' : 'gray' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface-dark border border-white/[0.06] rounded-xl p-3 flex items-center gap-2.5">
              <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left — Service List */}
        <div className="lg:col-span-4 h-full">
          <ProjectPanel
            services={devData.services}
            activeServiceId={activeServiceId}
            onSelectService={setActiveServiceId}
            onTriggerBuild={(id) => triggerBuild.mutate({ serviceId: id })}
          />
        </div>

        {/* Right — Dev Workspace */}
        <div className="lg:col-span-8 h-full">
          <DevWorkspace
            data={devData}
            activeServiceId={activeServiceId}
            onRunTests={(suiteId) => runTests.mutate({ suiteId })}
            onResolveIssue={(issueId) => resolveIssue.mutate({ issueId })}
          />
        </div>
      </div>
    </div>
  );
};
