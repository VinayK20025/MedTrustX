'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { TenantsPanel } from '../components/TenantsPanel';
import { IsolationPoliciesPanel } from '../components/IsolationPoliciesPanel';
import { AccessLogsPanel } from '../components/AccessLogsPanel';
import { ContextPropagationPanel } from '../components/ContextPropagationPanel';
import { useMultiTenant } from '../hooks/useMultiTenant';
import { Building2, Shield, Activity, Users, Database, Globe } from 'lucide-react';

interface TenantKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function TenantKPICard({ kpi }: { kpi: TenantKPI }) {
  const statusColors: Record<string, string> = {
    success: 'border-success/20 hover:border-success/40', normal: 'border-white/[0.06] hover:border-white/[0.12]',
    warning: 'border-warning/20 hover:border-warning/40', critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover', statusColors[kpi.status])}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-pink-500/15"><Icon className="w-4 h-4 text-pink-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const MultiTenantDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useTenants } = useMultiTenant();
  const tenantsQuery = useTenants();

  useEffect(() => {
    setPageMeta('Multi-Tenant Isolation', 'Logical data and network separation across DHOS hospital domains');
  }, [setPageMeta]);

  if (tenantsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: TenantKPI[] = [
    { id: 'tenants', title: 'Active Tenants', value: 14, status: 'success', icon: Building2, subtitle: 'Hospital facilities' },
    { id: 'users', title: 'Total Users', value: '24.5K', status: 'normal', icon: Users, subtitle: 'Across all tenants' },
    { id: 'policies', title: 'Isolation Policies', value: 248, status: 'success', icon: Shield, subtitle: 'Data & Network bounds' },
    { id: 'breaches', title: 'Isolation Breaches', value: 0, status: 'success', icon: Activity, subtitle: 'Last 30 days' },
    { id: 'databases', title: 'Tenant DBs', value: 42, status: 'normal', icon: Database, subtitle: 'Logical schemas' },
    { id: 'domains', title: 'Custom Domains', value: 18, status: 'success', icon: Globe, subtitle: 'Mapped hostnames' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Security' }, { label: 'Multi-Tenant Isolation' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-pink-300 bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/25">
          <Building2 className="w-3.5 h-3.5" />
          TENANT MANAGEMENT
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <TenantKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <TenantsPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <IsolationPoliciesPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <ContextPropagationPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <AccessLogsPanel />
        </div>
      </div>
    </div>
  );
};
