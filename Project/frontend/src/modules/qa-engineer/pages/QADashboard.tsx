'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TestSuitePanel } from '../components/TestSuitePanel';
import { QAWorkspace } from '../components/QAWorkspace';
import { useQADashboard, useRunSuite } from '../hooks/useQAAnalytics';
import { FlaskConical, Bug, BarChart3, Shield, Zap, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const QADashboard: React.FC = () => {
  const { data, isLoading } = useQADashboard();
  const runSuite = useRunSuite();
  const [activeSuiteId, setActiveSuiteId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading QA workspace...</div>;

  const { data: qaData } = data;
  const hasCritical = qaData.metrics.criticalDefects > 0;

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Engineering' }, { label: 'QA Dashboard' }]} />
        {hasCritical && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span><strong>Critical Defects:</strong> {qaData.metrics.criticalDefects} critical defect(s) open — release blocked pending resolution.</span>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Total Tests', value: qaData.metrics.totalTests, icon: FlaskConical, color: 'indigo' },
            { label: 'Pass Rate', value: `${qaData.metrics.passRate}%`, icon: FlaskConical, color: qaData.metrics.passRate >= 95 ? 'emerald' : 'amber' },
            { label: 'Open Defects', value: qaData.metrics.openDefects, icon: Bug, color: 'rose' },
            { label: 'Critical', value: qaData.metrics.criticalDefects, icon: XCircle, color: hasCritical ? 'red' : 'gray' },
            { label: 'Avg Coverage', value: `${qaData.metrics.avgCoverage}%`, icon: BarChart3, color: 'teal' },
            { label: 'Automation', value: `${qaData.metrics.automationRate}%`, icon: Zap, color: 'purple' },
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-4 h-full">
          <TestSuitePanel
            suites={qaData.suites}
            activeSuiteId={activeSuiteId}
            onSelectSuite={setActiveSuiteId}
            onRunSuite={(id) => runSuite.mutate({ id })}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <QAWorkspace data={qaData} activeSuiteId={activeSuiteId} />
        </div>
      </div>
    </div>
  );
};
