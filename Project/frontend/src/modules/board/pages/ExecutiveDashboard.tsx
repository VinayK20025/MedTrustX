'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { KPICard } from '../components/KPICard';
import { FinancialPanel } from '../components/FinancialPanel';
import { ClinicalQualityPanel } from '../components/ClinicalQualityPanel';
import { OperationsPanel } from '../components/OperationsPanel';
import { RiskAlertsPanel } from '../components/RiskAlertsPanel';
import { MultiHospitalComparison } from '../components/MultiHospitalComparison';
import { useBoardSummary } from '../hooks/useBoardAnalytics';
import type { DashboardFilters } from '../services/board.api';

export function ExecutiveDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<DashboardFilters>({ timeRange: '90d' });
  const { data, isLoading } = useBoardSummary(filters);

  useEffect(() => {
    setPageMeta('Executive Dashboard', 'Strategic group-level insights and performance metrics');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      {/* Header & Global Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Executive Insights' }, { label: 'Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            options={[
              { label: 'Trailing 7 Days', value: '7d' },
              { label: 'Trailing 30 Days', value: '30d' },
              { label: 'Trailing 90 Days', value: '90d' },
              { label: 'Year to Date', value: 'ytd' },
              { label: '1 Year', value: '1y' },
            ]}
            value={filters.timeRange}
            onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
            className="w-full sm:w-48 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {dashboard.summaryKpis.map((kpi, idx) => (
          <KPICard 
            key={kpi.id} 
            kpi={kpi} 
            priority={idx === 0 || idx === 1 ? 'strategic' : 'standard'} 
          />
        ))}
      </div>

      {/* Row 2: Financial & Clinical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <FinancialPanel data={dashboard.financial} />
        <ClinicalQualityPanel data={dashboard.clinical} />
      </div>

      {/* Row 3: Operations & Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <OperationsPanel data={dashboard.operations} className="lg:col-span-1" />
        <RiskAlertsPanel alerts={dashboard.recentAlerts} className="lg:col-span-2" />
      </div>

      {/* Row 4: Multi-Hospital Comparison */}
      <MultiHospitalComparison data={dashboard.hospitalComparisons} />
    </div>
  );
}
