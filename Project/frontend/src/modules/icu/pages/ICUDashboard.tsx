'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';
import { ICUPatientTable } from '../components/ICUPatientTable';
import { ICUAlertsList } from '../components/ICUAlertsList';
import { ICUIntegrationsPanel } from '../components/ICUIntegrationsPanel';
import { useICUDashboard } from '../hooks/useICUDashboard';
import type { ICUFilters } from '../services/icu.api';

function KPIChip({ kpi }: { kpi: { title: string; value: string | number; status: string; delta?: string } }) {
  const colors: Record<string, string> = { normal: 'border-white/[0.04] bg-white/[0.02]', success: 'border-success/20 bg-success/5', warning: 'border-warning/20 bg-warning/5', critical: 'border-emergency/20 bg-emergency/5' };
  const textColors: Record<string, string> = { normal: 'text-white', success: 'text-success-light', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 bg-surface-light flex flex-col justify-between shadow-glass', colors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      <p className={cn('text-2xl font-black mt-1', textColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
    </div>
  );
}

export function ICUDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<ICUFilters>({ unit: 'all' });
  const { data, isLoading } = useICUDashboard(filters);

  useEffect(() => {
    setPageMeta('ICU Overview', 'Critical care operations and telemetry');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'ICU' }, { label: 'Overview' }]} />
        <div className="flex gap-3">
          <Select
            options={[
              { label: 'All Units', value: 'all' },
              { label: 'Medical ICU', value: 'medical_icu' },
              { label: 'Neuro ICU', value: 'neuro_icu' },
              { label: 'Cardiac ICU', value: 'cardiac_icu' },
            ]}
            value={filters.unit ?? 'all'}
            onChange={(e) => setFilters({ ...filters, unit: e.target.value as ICUFilters['unit'] })}
            className="w-40 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {d.kpis.map((kpi) => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <ICUPatientTable patients={d.patients} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-5">
          <ICUAlertsList alerts={d.alerts} />
          <ICUIntegrationsPanel integrations={d.integrations} />
          <Card>
            <CardHeader title="ICU Quick Links" subtitle="Connected ICU workflows" />
            <CardBody className="flex flex-col gap-2">
              <Link href={ROUTES.ICU_NURSE_DASHBOARD}>
                <Button variant="secondary" className="w-full">ICU Nurse Workspace</Button>
              </Link>
              <Link href={ROUTES.INTENSIVIST_DASHBOARD}>
                <Button variant="secondary" className="w-full">Intensivist Review</Button>
              </Link>
              <Link href={ROUTES.MONITORING}>
                <Button variant="ghost" className="w-full">Service Monitoring</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
