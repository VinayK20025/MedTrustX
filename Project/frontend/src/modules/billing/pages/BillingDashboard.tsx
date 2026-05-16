'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { BillingPatientList } from '../components/BillingPatientList';
import { BillingChargesTable } from '../components/BillingChargesTable';
import { BillingSummaryPanel } from '../components/BillingSummaryPanel';
import { useBillingDashboard } from '../hooks/useBillingAnalytics';
import type { BillingFilters } from '../services/billing.api';
import type { BillingKPI } from '../types/billing.types';
import { IndianRupee, AlertTriangle, Plus, Tag, Receipt } from 'lucide-react';

function BillKPICard({ kpi }: { kpi: BillingKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  const fmtVal = kpi.format === 'currency' ? `₹${(Number(kpi.value) / 1000).toFixed(0)}K` : kpi.value.toLocaleString();
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'warning' && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{fmtVal}</p>
    </div>
  );
}

export function BillingDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<BillingFilters>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data, isLoading } = useBillingDashboard(filters);

  useEffect(() => { setPageMeta('Billing Executive', 'Revenue cycle management — billing, payments, and insurance coordination'); }, [setPageMeta]);

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
        <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Billing Executive' }]} />
        <div className="flex items-center gap-2">
          <Button className="bg-green-600 hover:bg-green-500 text-white font-bold h-9 px-4 text-[11px]" leftIcon={<Plus className="w-3.5 h-3.5" />}>Add Service</Button>
          <Button className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold h-9 px-4 text-[11px] border border-white/10" leftIcon={<Tag className="w-3.5 h-3.5" />}>Discount</Button>
          <Button className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold h-9 px-4 text-[11px] border border-white/10" leftIcon={<Receipt className="w-3.5 h-3.5" />}>Receipt</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <BillKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px]">
          <BillingPatientList patients={d.patients} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-5 h-[650px]">
          <BillingChargesTable items={d.lineItems} />
        </div>
        <div className="xl:col-span-4 h-[650px]">
          <BillingSummaryPanel summary={d.summary} payments={d.payments} billId={selectedId || 'BP-1'} />
        </div>
      </div>
    </div>
  );
}
