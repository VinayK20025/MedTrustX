'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { AccountsFinancialPanel } from '../components/AccountsFinancialPanel';
import { AccountsInsightPanel } from '../components/AccountsInsightPanel';
import { AccountsClaimsPanel } from '../components/AccountsClaimsPanel';
import { useAccountsDashboard } from '../hooks/useAccountsAnalytics';
import type { AccountsFilters } from '../services/accounts.api';
import type { AccountsKPI } from '../types/accounts.types';
import { Landmark, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

function AccKPICard({ kpi }: { kpi: AccountsKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  const fmtVal = kpi.format === 'currency' ? `₹${(kpi.value / 1000).toFixed(0)}K` : kpi.format === 'percentage' ? `${kpi.value}%` : kpi.value.toLocaleString();
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'warning' && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{fmtVal}</p>
      {kpi.trend && (
        <div className="flex items-center gap-1 mt-1">
          {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3 text-success-light" /> : <TrendingDown className="w-3 h-3 text-emergency-light" />}
          <span className={cn("text-[10px] font-mono font-bold", kpi.trend === 'up' ? "text-success-light" : "text-emergency-light")}>{kpi.trendValue}</span>
        </div>
      )}
    </div>
  );
}

export function AccountsDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<AccountsFilters>({});
  const { data, isLoading } = useAccountsDashboard(filters);

  useEffect(() => { setPageMeta('Accounts Manager', 'Financial intelligence — revenue, expenses, reconciliation, and audit'); }, [setPageMeta]);

  if (isLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Accounts Command' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <Landmark className="w-3.5 h-3.5" /> FINANCIAL COMMAND
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <AccKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 h-[650px]">
          <AccountsFinancialPanel revenue={d.revenue} expenses={d.expenses} />
        </div>
        <div className="xl:col-span-3 h-[650px]">
          <AccountsClaimsPanel claims={d.claims} />
        </div>
        <div className="xl:col-span-4 h-[650px]">
          <AccountsInsightPanel reconciliation={d.reconciliation} auditLogs={d.auditLogs} />
        </div>
      </div>
    </div>
  );
}
