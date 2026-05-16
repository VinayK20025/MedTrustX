'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { SuperKPICard } from '@/modules/superintendent/components/SuperKPICard';
import { PatientGrid } from '../components/PatientGrid';
import { UnitAlertsPanel } from '../components/UnitAlertsPanel';
import { UnitStaffPanel } from '../components/UnitStaffPanel';
import { useUnitHeadDashboard } from '../hooks/useUnitHeadAnalytics';
import type { UnitFilters } from '../services/unit-head.api';

export function UnitHeadDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<UnitFilters>({ unit: 'icu' });
  const { data, isLoading } = useUnitHeadDashboard(filters);

  useEffect(() => {
    setPageMeta('Critical Care Command', 'Real-time patient monitoring & intervention');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No unit data available</div>;

  const criticalCount = d.patients.filter(p => p.severity === 'critical').length;
  const unackAlerts = d.alerts.filter(a => !a.acknowledged).length;
  const liveStatus = unackAlerts > 0 || criticalCount >= 3 ? 'ALERT' : criticalCount > 0 ? 'ACTIVE' : 'STABLE';
  const liveColor = liveStatus === 'ALERT' ? 'bg-emergency/10 border-emergency/20 text-emergency-light' : liveStatus === 'ACTIVE' ? 'bg-warning/10 border-warning/20 text-warning-light' : 'bg-success/10 border-success/20 text-success-light';
  const liveDot = liveStatus === 'ALERT' ? 'bg-emergency' : liveStatus === 'ACTIVE' ? 'bg-warning' : 'bg-success';

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Unit Head' }, { label: `${d.unitName} Dashboard` }]} />
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${liveColor}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveDot}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveDot}`}></span>
            </span>
            {d.unitName} — {liveStatus}
          </div>
          <Select
            options={[
              { label: 'ICU', value: 'icu' },
              { label: 'ER', value: 'er' },
              { label: 'OT', value: 'ot' },
              { label: 'Dialysis', value: 'dialysis' },
            ]}
            value={filters.unit}
            onChange={(e) => setFilters({ unit: e.target.value as any })}
            className="w-full sm:w-36 bg-surface-dark border-white/[0.08]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {d.kpis.map(kpi => <SuperKPICard key={kpi.id} kpi={kpi as any} />)}
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emergency"></span></span>
          Live Patient Grid — {d.patients.length} Beds
        </h3>
        <PatientGrid patients={d.patients} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UnitAlertsPanel alerts={d.alerts} />
        <UnitStaffPanel staff={d.staff} />
      </div>
    </div>
  );
}
