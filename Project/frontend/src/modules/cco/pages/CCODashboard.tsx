'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { CcoKPICard } from '../components/CcoKPICard';
import { AuditPanel } from '../components/AuditPanel';
import { ViolationsPanel } from '../components/ViolationsPanel';
import { RiskPanel } from '../components/RiskPanel';
import { DocsPanel } from '../components/DocsPanel';
import { useCcoDashboard } from '../hooks/useCcoAnalytics';
import type { CcoFilters } from '../services/cco.api';

export function CCODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CcoFilters>({ period: 'current' });
  const { data, isLoading } = useCcoDashboard(filters);

  useEffect(() => {
    setPageMeta('Compliance Governance', 'Audit orchestration, policy enforcement & regulatory readiness');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[420px] w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No compliance data available</div>;

  // Derive compliance posture
  const score = dashboard.kpis.find(k => k.title.includes('Score'));
  const scoreVal = score ? parseInt(String(score.value)) : 0;
  const posture = scoreVal >= 95 ? 'COMPLIANT' : scoreVal >= 85 ? 'AT RISK' : 'NON-COMPLIANT';
  const postureColor = posture === 'COMPLIANT' ? 'bg-success/10 border-success/20 text-success-light' : posture === 'AT RISK' ? 'bg-warning/10 border-warning/20 text-warning-light' : 'bg-emergency/10 border-emergency/20 text-emergency-light';

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'CCO Command' }, { label: 'Compliance Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Compliance Posture Indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold ${postureColor}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${posture === 'COMPLIANT' ? 'bg-success' : posture === 'AT RISK' ? 'bg-warning' : 'bg-emergency'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${posture === 'COMPLIANT' ? 'bg-success' : posture === 'AT RISK' ? 'bg-warning' : 'bg-emergency'}`}></span>
            </span>
            {posture}
          </div>
          <Select
            options={[
              { label: 'Current Period', value: 'current' },
              { label: 'Q1 2026', value: 'q1' },
              { label: 'Q2 2026', value: 'q2' },
              { label: 'Yearly', value: 'yearly' },
            ]}
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
            className="w-full sm:w-44 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row — 5 compliance metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {dashboard.kpis.map((kpi) => (
          <CcoKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Audits + Risk Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AuditPanel audits={dashboard.audits} />
        </div>
        <div>
          <RiskPanel areas={dashboard.riskAreas} />
        </div>
      </div>

      {/* Violations + Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ViolationsPanel violations={dashboard.violations} />
        <DocsPanel items={dashboard.docCompliance} />
      </div>
    </div>
  );
}
