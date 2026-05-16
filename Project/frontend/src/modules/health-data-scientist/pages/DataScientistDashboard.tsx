'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ExplorationPanel } from '../components/ExplorationPanel';
import { DataScientistWorkspace } from '../components/DataScientistWorkspace';
import { useDataScientistDashboard, useRetrainPredictiveModel, useExportCohort } from '../hooks/useDataScientistAnalytics';
import { BrainCircuit, Activity, AlertTriangle, Users, Database, Zap } from 'lucide-react';

export const DataScientistDashboard: React.FC = () => {
  const { data, isLoading } = useDataScientistDashboard();
  const retrain = useRetrainPredictiveModel();
  const exportCohort = useExportCohort();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Health Data Science Platform...</div>;

  const { data: ds } = data;
  const criticalAlerts = ds.alerts.filter(a => a.severity === 'Critical');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Data Platform' }, { label: 'Health Data Scientist Dashboard' }]} />

        {criticalAlerts.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Critical Insight Anomaly:</strong> {criticalAlerts[0].description} View Population Health tab for details.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Total Analyzed', value: `${(ds.metrics.totalPatientsAnalyzed / 1000).toFixed(1)}k`, icon: Users, color: 'indigo' },
            { label: 'High Risk Patients', value: ds.metrics.highRiskIdentified.toLocaleString(), icon: AlertTriangle, color: 'rose' },
            { label: 'Active Models', value: ds.metrics.activeModels, icon: BrainCircuit, color: 'purple' },
            { label: 'Avg Accuracy', value: `${ds.metrics.avgModelAccuracy}%`, icon: Activity, color: ds.metrics.avgModelAccuracy > 90 ? 'emerald' : 'amber' },
            { label: 'Pred. Latency', value: `${ds.metrics.predictionLatencyMs}ms`, icon: Zap, color: ds.metrics.predictionLatencyMs < 200 ? 'teal' : 'amber' },
            { label: 'Data Coverage', value: `${ds.metrics.dataCoverage}%`, icon: Database, color: 'emerald' },
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
        <div className="lg:col-span-3 h-full">
          <ExplorationPanel
            cohorts={ds.cohorts}
            onExportCohort={(id) => exportCohort.mutate({ id })}
          />
        </div>
        <div className="lg:col-span-9 h-full">
          <DataScientistWorkspace
            data={ds}
            onRetrainModel={(id) => retrain.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
