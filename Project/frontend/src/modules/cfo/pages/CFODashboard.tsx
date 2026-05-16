'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { CfoKPICard } from '../components/CfoKPICard';
import { RevenuePanel } from '../components/RevenuePanel';
import { CostPanel } from '../components/CostPanel';
import { CashFlowPanel } from '../components/CashFlowPanel';
import { CfoAlertsPanel } from '../components/CfoAlertsPanel';
import { useCfoDashboard } from '../hooks/useCfoAnalytics';
import type { CfoFilters } from '../services/cfo.api';

export function CFODashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<CfoFilters>({ period: 'mtd' });
  const { data, isLoading } = useCfoDashboard(filters);

  useEffect(() => {
    setPageMeta('Financial Intelligence', 'Revenue optimization, cost governance & cash flow tracking');
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
          <Skeleton className="h-[380px] w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-[380px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const dashboard = data?.data;
  if (!dashboard) return <div className="text-gray-500 py-20 text-center">No financial data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'CFO Command' }, { label: 'Financial Dashboard' }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            options={[
              { label: 'Month to Date', value: 'mtd' },
              { label: 'Quarter to Date', value: 'qtd' },
              { label: 'Year to Date', value: 'ytd' },
            ]}
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
            className="w-full sm:w-48 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      {/* KPI Summary Row — 5 financial metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {dashboard.kpis.map((kpi) => (
          <CfoKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Revenue Trends + Cost Centers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenuePanel data={dashboard.revenueTrends} />
        </div>
        <div>
          <CostPanel centers={dashboard.costCenters} />
        </div>
      </div>

      {/* Cash Flow + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CashFlowPanel data={dashboard.cashFlow} />
        <CfoAlertsPanel alerts={dashboard.alerts} />
      </div>
    </div>
  );
}
