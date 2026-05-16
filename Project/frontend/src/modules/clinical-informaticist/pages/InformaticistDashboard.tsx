'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { WorkflowPanel } from '../components/WorkflowPanel';
import { InformaticistWorkspace } from '../components/InformaticistWorkspace';
import { useInformaticistDashboard, useDismissAlert, useTuneCDSSRule } from '../hooks/useInformaticistAnalytics';
import { Workflow, BookOpen, Activity, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export const InformaticistDashboard: React.FC = () => {
  const { data, isLoading } = useInformaticistDashboard();
  const dismiss = useDismissAlert();
  const tune = useTuneCDSSRule();
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Clinical Informatics Platform...</div>;

  const { data: info } = data;
  const criticalAlerts = info.alerts.filter(a => a.severity === 'Critical');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Clinical Intelligence' }, { label: 'Informaticist Dashboard' }]} />

        {criticalAlerts.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Critical Mapping Error:</strong> {criticalAlerts[0].description} Immediate standardization review required.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Data Completeness', value: `${info.metrics.dataCompleteness}%`, icon: ShieldAlert, color: info.metrics.dataCompleteness >= 95 ? 'emerald' : 'amber' },
            { label: 'Alert Accuracy', value: `${info.metrics.alertAccuracy}%`, icon: CheckCircle2, color: 'teal' },
            { label: 'Standardization', value: `${info.metrics.standardizationRate}%`, icon: BookOpen, color: 'indigo' },
            { label: 'Active Workflows', value: info.metrics.activeWorkflows, icon: Workflow, color: 'purple' },
            { label: 'CDSS Fired', value: info.metrics.cdssFiredToday, icon: Activity, color: 'emerald' },
            { label: 'Clinician Sat.', value: `${info.metrics.clinicianSatisfaction}/100`, icon: CheckCircle2, color: info.metrics.clinicianSatisfaction >= 80 ? 'teal' : 'rose' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface-dark border border-white/[0.06] rounded-xl p-3 flex items-center gap-2.5">
              <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <p className="text-base font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-4 h-full">
          <WorkflowPanel
            workflows={info.workflows}
            activeWorkflowId={activeWorkflowId}
            onSelectWorkflow={setActiveWorkflowId}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <InformaticistWorkspace
            data={info}
            onDismissAlert={(id) => dismiss.mutate({ id })}
            onTuneCDSSRule={(id) => tune.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
