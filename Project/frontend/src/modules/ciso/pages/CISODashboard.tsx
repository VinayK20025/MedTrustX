'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { CisoKPICard } from '../components/CisoKPICard';
import { ThreatPanel } from '../components/ThreatPanel';
import { AccessPanel } from '../components/AccessPanel';
import { CisoAlertsPanel } from '../components/CisoAlertsPanel';
import { SecurityIncidentPanel } from '../components/SecurityIncidentPanel';
import { CompliancePanel } from '../components/CompliancePanel';
import { useCisoDashboard } from '../hooks/useCisoAnalytics';
import type { CisoFilters } from '../services/ciso.api';

export function CISODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CisoFilters>({ timeWindow: '1h', severityFilter: 'all' });
  const { data, isLoading } = useCisoDashboard(filters);

  useEffect(() => {
    setPageMeta('Security Operations Center', 'Zero Trust threat monitoring, access intelligence & compliance');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[450px] w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-[450px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No security telemetry available</div>;

  // Derive threat level from active critical threats
  const safeThreats = dashboard.threats || [];
  const criticalCount = safeThreats.filter(t => t.severity === 'critical' && t.status === 'active').length;
  const threatLevel = criticalCount >= 2 ? 'CRITICAL' : criticalCount >= 1 ? 'ELEVATED' : 'NORMAL';
  const threatColor = threatLevel === 'CRITICAL' ? 'bg-emergency/10 border-emergency/20 text-emergency-light' : threatLevel === 'ELEVATED' ? 'bg-warning/10 border-warning/20 text-warning-light' : 'bg-success/10 border-success/20 text-success-light';

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'CISO Command' }, { label: 'Security Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Threat Level Indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold ${threatColor}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${threatLevel === 'CRITICAL' ? 'bg-emergency' : threatLevel === 'ELEVATED' ? 'bg-warning' : 'bg-success'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${threatLevel === 'CRITICAL' ? 'bg-emergency' : threatLevel === 'ELEVATED' ? 'bg-warning' : 'bg-success'}`}></span>
            </span>
            THREAT: {threatLevel}
          </div>
          <Select
            options={[
              { label: 'Last 1 Hour', value: '1h' },
              { label: 'Last 6 Hours', value: '6h' },
              { label: 'Last 24 Hours', value: '24h' },
              { label: 'Last 7 Days', value: '7d' },
            ]}
            value={filters.timeWindow}
            onChange={(e) => setFilters({ ...filters, timeWindow: e.target.value as any })}
            className="w-full sm:w-40 bg-surface-dark border-white/[0.08]"
          />
          <Select
            options={[
              { label: 'All Severity', value: 'all' },
              { label: 'Critical Only', value: 'critical' },
              { label: 'High+', value: 'high' },
            ]}
            value={filters.severityFilter}
            onChange={(e) => setFilters({ ...filters, severityFilter: e.target.value as any })}
            className="w-full sm:w-36 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row — 5 cards for security metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {(dashboard.kpis || []).map((kpi) => (
          <CisoKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Threat Intelligence + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ThreatPanel threats={dashboard.threats || []} />
        </div>
        <div>
          <CompliancePanel metrics={dashboard.compliance || []} />
        </div>
      </div>

      {/* Access Intelligence */}
      <AccessPanel logs={dashboard.accessLogs || []} />

      {/* Alerts + Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CisoAlertsPanel alerts={dashboard.alerts || []} />
        <SecurityIncidentPanel incidents={dashboard.incidents || []} />
      </div>
    </div>
  );
}
